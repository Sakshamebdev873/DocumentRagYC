import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-2",
});

export const proModel = genAI.getGenerativeModel({
  model: "gemini-3.1-pro-preview",
});
