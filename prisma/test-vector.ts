import { prisma } from "../src/config/prisma";
import { embeddingModel } from "../src/config/gemini";

async function main() {
  const result = await embeddingModel.embedContent("remote work policy");
  const embedding = result.embedding.values;

  // Query WITHOUT filter
  const resNoFilter = await prisma.$runCommandRaw({
    aggregate: "document_chunks",
    pipeline: [
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: embedding,
          numCandidates: 10,
          limit: 2
        }
      }
    ],
    cursor: {}
  });
  console.log("Without filter:", (resNoFilter as any).cursor?.firstBatch?.length);

  // Query WITH filter
  const resWithFilter = await prisma.$runCommandRaw({
    aggregate: "document_chunks",
    pipeline: [
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: embedding,
          numCandidates: 10,
          limit: 2,
          filter: { isActive: true, allowedRole: "EMPLOYEE" }
        }
      }
    ],
    cursor: {}
  });
  console.log("With filter:", (resWithFilter as any).cursor?.firstBatch?.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
