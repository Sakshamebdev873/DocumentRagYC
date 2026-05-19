import { prisma } from "../config/prisma";
import { embeddingModel } from "../config/gemini";
const pdfParse = require("pdf-parse");
import * as xlsx from "xlsx";
import { Role } from "../../generated/prisma";

const chunkText = (text: string, maxTokens: number = 500): string[] => {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let currentChunk: string[] = [];

  for (const word of words) {
    currentChunk.push(word);
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
  department: string | null,
  visibleToUserIds: string[],
) => {
  const document = await prisma.document.create({
    data: {
      filename,
      fileType: mimetype,
      uploadedBy: userId,
      ingestionStatus: "PROCESSING",
      allowedRole,
      department,
      visibleToUserIds,
    },
  });

  try {
    let rawText = "";

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
      rawText = jsonData.map((row) => JSON.stringify(row)).join("\n");
    } else if (mimetype === "text/plain") {
      rawText = fileBuffer.toString("utf-8");
    } else {
      throw new Error("Unsupported file type");
    }

    const chunks = chunkText(rawText);

    for (let index = 0; index < chunks.length; index += 1) {
      const textChunk = chunks[index];
      const result = await embeddingModel.embedContent(textChunk);
      const embeddingValues = result.embedding.values;

      await prisma.documentChunk.create({
        data: {
          chunkIndex: index,
          text: textChunk,
          embedding: embeddingValues,
          documentId: document.id,
          allowedRole,
          department,
          visibleToUserIds,
          isActive: true,
        },
      });
    }

    await prisma.document.update({
      where: { id: document.id },
      data: { ingestionStatus: "COMPLETED" },
    });

    return document;
  } catch (error: any) {
    await prisma.document.update({
      where: { id: document.id },
      data: {
        ingestionStatus: "FAILED",
        errorMessage: error.message || "Unknown error during ingestion",
      },
    });
    throw error;
  }
};
