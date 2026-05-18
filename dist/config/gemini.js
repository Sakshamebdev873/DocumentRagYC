"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proModel = exports.embeddingModel = exports.genAI = void 0;
const generative_ai_1 = require("@google/generative-ai");
if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
}
exports.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
exports.embeddingModel = exports.genAI.getGenerativeModel({
    model: "gemini-embedding-2",
});
exports.proModel = exports.genAI.getGenerativeModel({
    model: "gemini-3.1-pro-preview",
});
