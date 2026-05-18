import { prisma } from "../config/prisma";
import { embeddingModel, proModel } from "../config/gemini";
import { AuthPayload, RawChunk } from "../types";

// Helper function for Cosine Similarity (Fallback for Atlas Vector Search)
function cosineSimilarity(A: number[], B: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < A.length; i++) {
    dotProduct += A[i] * B[i];
    normA += A[i] * A[i];
    normB += B[i] * B[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const executeQuery = async (queryText: string, user: AuthPayload) => {
  // 1. Generate query embedding
  const result = await embeddingModel.embedContent(queryText);
  const queryEmbedding = result.embedding.values;

  // 2. Fetch all permissible chunks (Enforcing DB-Level RBAC Filters)
  const allowedRoles = user.role === "ADMIN" ? ["ADMIN", "EMPLOYEE"] : ["EMPLOYEE"];

  const allChunks = await prisma.documentChunk.findMany({
    where: {
      isActive: true,
      allowedRole: { in: allowedRoles as any },
      OR: [
        { department: user.department },
        { department: null }
      ]
    }
  });

  // 3. Fallback: Perform Cosine Similarity in JavaScript
  const scoredDocs = allChunks.map(chunk => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  })).sort((a, b) => b.score - a.score).slice(0, 5);

  const rawDocs = scoredDocs;

  if (rawDocs.length === 0) {
    throw new Error("No relevant context found within your access level.");
  }

  const contextText = rawDocs.map(doc => doc.text).join("\n\n");
  const sourceChunks = rawDocs.map(doc => doc.id);

  const prompt = `You are a helpful AI Employee. You have been asked to fulfill the following request: "${queryText}".
Here is the retrieved organizational context:
${contextText}

Use the context to answer the user's request. If the context doesn't have the exact answer, do your best to summarize what is related, or provide a helpful general response while clarifying what is or isn't in the official company documents.`;


  const draftTool = {
    name: "draft_document",
    description: "Drafts a document based on user request and organization context.",
    parameters: {
      type: "OBJECT",
      properties: {
        draftType: {
          type: "STRING",
          description: "The type of document (e.g., 'Regulatory Alert', 'Compliance Filing', 'Summary')"
        },
        title: {
          type: "STRING",
          description: "A formal title for the draft"
        },
        content: {
          type: "STRING",
          description: "The main body content of the draft"
        },
        actionItems: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "Any actionable items extracted from context"
        }
      },
      required: ["draftType", "title", "content"]
    }
  };

  const chat = proModel.startChat({
    tools: [{ functionDeclarations: [draftTool] as any }],
  });

  const response = await chat.sendMessage(prompt);

  // Extract Function Call (Tool) Output
  const functionCall = response.response.functionCalls()?.[0];

  let args: any;
  if (!functionCall || functionCall.name !== "draft_document") {
    const textFallback = response.response.text();
    if (textFallback) {
      args = {
        draftType: "AI Response",
        title: "Agent Reply",
        content: textFallback,
        actionItems: []
      };
    } else {
      throw new Error("The AI failed to generate a structured draft document and returned no text.");
    }
  } else {
    args = functionCall.args;
  }

  // 5. Save the Human-In-The-Loop Draft
  const workflowDraft = await prisma.workflowDraft.create({
    data: {
      userId: user.userId,
      query: queryText,
      sourceChunks: sourceChunks,
      draftType: args.draftType,
      draftContent: args as any,
      status: "PENDING"
    }
  });

  return workflowDraft;
};
