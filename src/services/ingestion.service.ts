import { prisma } from "../config/prisma";
import { embeddingModel } from "../config/gemini";
const pdfParse = require("pdf-parse");
import * as xlsx from "xlsx";
import { Role } from "../../generated/prisma";

// Basic chunking by paragraphs or large sentences to stay under limits
const chunkText = (text: string, maxTokens: number = 500): string[] => {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  
  for (const word of words) {
    currentChunk.push(word);
    // Rough heuristic: 1 token ~= 1.33 words
    if (currentChunk.length >= maxTokens) {
      chunks.push(currentChunk.join(" "));
      currentChunk = [];
    }
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }
  return chunks;
};

export const processUpload = async (
  fileBuffer: Buffer,
  filename: string,
  mimetype: string,
  userId: string,
  allowedRole: Role,
  department: string | null
) => {
  // 1. Create initial Document entry tracking ingestion
  const document = await prisma.document.create({
    data: {
      filename,
      fileType: mimetype,
      uploadedBy: userId,
      ingestionStatus: "PROCESSING",
      allowedRole,
      department
    }
  });

  try {
    let rawText = "";

    // 2. Extract Text based on mime type
    if (mimetype === "application/pdf") {
      const pdfData = await pdfParse(fileBuffer);
      rawText = pdfData.text;
    } else if (
      mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimetype === "text/csv"
    ) {
      const workbook = xlsx.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
      
      // Convert rows to semantic text
      rawText = jsonData.map(row => JSON.stringify(row)).join("\n");
    } else if (mimetype === "text/plain") {
      rawText = fileBuffer.toString("utf-8");
    } else {
      throw new Error("Unsupported file type");
    }

    // 3. Chunk Text
    const chunks = chunkText(rawText);

    // 4. Generate Embeddings & Save
    for (let i = 0; i < chunks.length; i++) {
      const textChunk = chunks[i];
      // Generate 768-dimensional vector via Gemini API
      const result = await embeddingModel.embedContent(textChunk);
      const embeddingValues = result.embedding.values;

      await prisma.documentChunk.create({
        data: {
          chunkIndex: i,
          text: textChunk,
          embedding: embeddingValues,
          documentId: document.id,
          allowedRole,
          department,
          isActive: true
        }
      });
    }

    // 5. Update Status
    await prisma.document.update({
      where: { id: document.id },
      data: { ingestionStatus: "COMPLETED" }
    });

    return document;

  } catch (error: any) {
    await prisma.document.update({
      where: { id: document.id },
      data: { 
        ingestionStatus: "FAILED",
        errorMessage: error.message || "Unknown error during ingestion"
      }
    });
    throw error;
  }
};
