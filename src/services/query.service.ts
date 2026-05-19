import { prisma } from "../config/prisma";
import { embeddingModel, proModel } from "../config/gemini";
import { AuthPayload } from "../types";

const NO_MATCH_RESPONSE = {
  draftType: "Knowledge Gap Response",
  title: "Requested information is not present",
  content:
    "The requested information is not present in the currently accessible company documents. I can help with something else if you want to ask about another policy, process, document summary, or department-specific topic.",
  actionItems: [
    "Try asking about a different policy, handbook, or process",
    "Ask an admin to assign the right document to you if it should be accessible",
    "Refine the question with a document name or team context",
  ],
};

function sanitizeText(value: string) {
  return value
    .replace(/\*{2,}/g, "")
    .replace(/\/{2,}/g, "")
    .replace(/#{1,6}\s*/g, "")
    .replace(/`{1,3}/g, "")
    .replace(/[_~]+/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sanitizeActionItems(items: unknown) {
  if (!Array.isArray(items)) {
    return [] as string[];
  }

  return items.map((item) => sanitizeText(String(item))).filter(Boolean);
}

function sanitizeDraft(args: {
  draftType?: unknown;
  title?: unknown;
  content?: unknown;
  actionItems?: unknown;
}) {
  return {
    draftType: sanitizeText(String(args.draftType ?? "Context Response")),
    title: sanitizeText(String(args.title ?? "Context response")),
    content: sanitizeText(String(args.content ?? "")),
    actionItems: sanitizeActionItems(args.actionItems),
  };
}

function buildFallbackTitle(queryText: string) {
  const cleaned = sanitizeText(queryText).replace(/[?!.]+$/g, "").trim();
  if (!cleaned) {
    return "Context response";
  }

  const normalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return normalized.length > 72 ? `${normalized.slice(0, 69)}...` : normalized;
}

function cosineSimilarity(A: number[], B: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let index = 0; index < A.length; index += 1) {
    dotProduct += A[index] * B[index];
    normA += A[index] * A[index];
    normB += B[index] * B[index];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const executeQuery = async (queryText: string, user: AuthPayload) => {
  const result = await embeddingModel.embedContent(queryText);
  const queryEmbedding = result.embedding.values;

  const allowedRoles = user.role === "ADMIN" ? ["ADMIN", "EMPLOYEE"] : ["EMPLOYEE"];

  const allChunks = await prisma.documentChunk.findMany({
    where: {
      isActive: true,
      allowedRole: { in: allowedRoles as any },
      ...(user.role === "ADMIN" ? {} : { visibleToUserIds: { has: user.userId } }),
    },
  });

  const scoredDocs = allChunks
    .map((chunk) => ({
      ...chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);

  if (scoredDocs.length === 0 || scoredDocs[0].score < 0.15) {
    return prisma.workflowDraft.create({
      data: {
        userId: user.userId,
        query: queryText,
        sourceChunks: [],
        draftType: NO_MATCH_RESPONSE.draftType,
        draftContent: NO_MATCH_RESPONSE as any,
        status: "PENDING",
      },
    });
  }

  const contextText = scoredDocs.map((doc) => doc.text).join("\n\n");
  const sourceChunks = scoredDocs.map((doc) => doc.id);

  const prompt = `You are DocumentRag, an internal AI copilot for software teams.
You are answering this employee question: "${queryText}"

Retrieved internal context:
${contextText}

Rules:
- Use only the retrieved internal context.
- Ground every important claim in the supplied documents.
- If the answer is not supported by the context, say the information is not present in the available documents.
- Keep the answer concise, plain-language, and useful for engineering teams.
- Avoid markdown, decorative formatting, headings with symbols, and filler language.
- Prefer short paragraphs or simple numbered steps written as plain text.
- Include practical next steps only when the context supports them.

Return a structured response with:
- draftType: use "Context Response" unless a more specific engineering answer type is clearly justified
- title: a short query-derived title
- content: the answer text
- actionItems: optional short follow-up items grounded in context`;

  const draftTool = {
    name: "draft_document",
    description: "Drafts a grounded internal answer from retrieved company context.",
    parameters: {
      type: "OBJECT",
      properties: {
        draftType: {
          type: "STRING",
          description: "Short answer category, usually Context Response.",
        },
        title: {
          type: "STRING",
          description: "A short title derived from the employee query.",
        },
        content: {
          type: "STRING",
          description: "The grounded answer in plain language.",
        },
        actionItems: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "Optional follow-up items supported by the context.",
        },
      },
      required: ["draftType", "title", "content"],
    },
  };

  const chat = proModel.startChat({
    tools: [{ functionDeclarations: [draftTool] as any }],
  });

  const response = await chat.sendMessage(prompt);
  const functionCall = response.response.functionCalls()?.[0];

  let args: Record<string, unknown>;
  if (!functionCall || functionCall.name !== "draft_document") {
    const textFallback = response.response.text();
    if (!textFallback) {
      throw new Error("The AI failed to generate a structured draft document and returned no text.");
    }

    args = {
      draftType: "Context Response",
      title: buildFallbackTitle(queryText),
      content: textFallback,
      actionItems: [],
    };
  } else {
    args = functionCall.args as Record<string, unknown>;
  }

  const sanitizedDraft = sanitizeDraft({
    ...args,
    draftType: args.draftType ?? "Context Response",
    title: args.title ?? buildFallbackTitle(queryText),
  });

  const workflowDraft = await prisma.workflowDraft.create({
    data: {
      userId: user.userId,
      query: queryText,
      sourceChunks,
      draftType: sanitizedDraft.draftType,
      draftContent: sanitizedDraft as any,
      status: "PENDING",
    },
  });

  return workflowDraft;
};
