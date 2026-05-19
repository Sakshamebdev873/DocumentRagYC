"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.processUpload = void 0;
const prisma_1 = require("../config/prisma");
const gemini_1 = require("../config/gemini");
const pdfParse = require("pdf-parse");
const xlsx = __importStar(require("xlsx"));
const chunkText = (text, maxTokens = 500) => {
    const words = text.split(/\s+/);
    const chunks = [];
    let currentChunk = [];
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
const processUpload = async (fileBuffer, filename, mimetype, userId, allowedRole, department, visibleToUserIds) => {
    const document = await prisma_1.prisma.document.create({
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
        }
        else if (mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            mimetype === "text/csv") {
            const workbook = xlsx.read(fileBuffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(worksheet);
            rawText = jsonData.map((row) => JSON.stringify(row)).join("\n");
        }
        else if (mimetype === "text/plain") {
            rawText = fileBuffer.toString("utf-8");
        }
        else {
            throw new Error("Unsupported file type");
        }
        const chunks = chunkText(rawText);
        for (let index = 0; index < chunks.length; index += 1) {
            const textChunk = chunks[index];
            const result = await gemini_1.embeddingModel.embedContent(textChunk);
            const embeddingValues = result.embedding.values;
            await prisma_1.prisma.documentChunk.create({
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
        await prisma_1.prisma.document.update({
            where: { id: document.id },
            data: { ingestionStatus: "COMPLETED" },
        });
        return document;
    }
    catch (error) {
        await prisma_1.prisma.document.update({
            where: { id: document.id },
            data: {
                ingestionStatus: "FAILED",
                errorMessage: error.message || "Unknown error during ingestion",
            },
        });
        throw error;
    }
};
exports.processUpload = processUpload;
