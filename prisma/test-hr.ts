import { prisma } from "../src/config/prisma";
import { embeddingModel } from "../src/config/gemini";

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

async function main() {
  const queryText = "what are HR test policy";
  const result = await embeddingModel.embedContent(queryText);
  const queryEmbedding = result.embedding.values;

  const allChunks = await prisma.documentChunk.findMany({
    where: {
      isActive: true,
      allowedRole: { in: ["EMPLOYEE", "ADMIN"] },
      OR: [
        { department: "HR" },
        { department: null }
      ]
    }
  });

  const scoredDocs = allChunks.map(chunk => ({
    text: chunk.text,
    department: chunk.department,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  })).sort((a, b) => b.score - a.score).slice(0, 5);

  console.log("Found Chunks:");
  scoredDocs.forEach((d, i) => {
    console.log(`[${i}] Score: ${d.score.toFixed(4)}, Dept: ${d.department}`);
    console.log(d.text.substring(0, 100) + "...");
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
