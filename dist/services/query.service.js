"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeQuery = void 0;
const prisma_1 = require("../config/prisma");
const gemini_1 = require("../config/gemini");
const executeQuery = async (queryText, user) => {
    // 1. Generate query embedding
    const result = await gemini_1.embeddingModel.embedContent(queryText);
    const queryEmbedding = result.embedding.values;
    // 2. Enforce DB-Level RBAC Filters for MongoDB Vector Search
    const filterCriteria = {
        isActive: true,
    };
    if (user.role !== "ADMIN") {
        filterCriteria.allowedRole = "EMPLOYEE";
    }
    else {
        filterCriteria.allowedRole = { $in: ["ADMIN", "EMPLOYEE"] };
    }
    if (user.department) {
        filterCriteria.department = { $in: [user.department, null] };
    }
    // 3. Raw MongoDB Vector Search via Prisma $runCommandRaw
    const searchResult = await prisma_1.prisma.$runCommandRaw({
        aggregate: "document_chunks",
        pipeline: [
            {
                $vectorSearch: {
                    index: "vector_index", // Requires an Atlas Vector Search index named 'vector_index'
                    path: "embedding",
                    queryVector: queryEmbedding,
                    numCandidates: 100,
                    limit: 5,
                    filter: filterCriteria,
                }
            },
            {
                $project: {
                    _id: 1,
                    text: 1,
                    score: { $meta: "vectorSearchScore" },
                    documentId: 1,
                    chunkIndex: 1,
                }
            }
        ],
        cursor: {}
    });
    const rawDocs = searchResult.cursor?.firstBatch || [];
    if (rawDocs.length === 0) {
        throw new Error("No relevant context found within your access level.");
    }
    const contextText = rawDocs.map(doc => doc.text).join("\n\n");
    const sourceChunks = rawDocs.map(doc => doc._id.$oid);
    // 4. Agentic Drafting via Gemini 1.5 Pro with Structured Tools
    const prompt = `You are an AI Employee. You have been asked to fulfill the following request: "${queryText}".
Use the following strict organizational context to fulfill it:
${contextText}

If the context does not contain the answer, reply that you don't know based on the provided documents.`;
    // Provide tool schema for deterministic drafting
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
    const chat = gemini_1.proModel.startChat({
        tools: [{ functionDeclarations: [draftTool] }],
    });
    const response = await chat.sendMessage(prompt);
    // Extract Function Call (Tool) Output
    const functionCall = response.response.functionCalls()?.[0];
    if (!functionCall || functionCall.name !== "draft_document") {
        throw new Error("The AI failed to generate a structured draft document.");
    }
    const args = functionCall.args;
    // 5. Save the Human-In-The-Loop Draft
    const workflowDraft = await prisma_1.prisma.workflowDraft.create({
        data: {
            userId: user.userId,
            query: queryText,
            sourceChunks: sourceChunks,
            draftType: args.draftType,
            draftContent: args,
            status: "PENDING"
        }
    });
    return workflowDraft;
};
exports.executeQuery = executeQuery;
