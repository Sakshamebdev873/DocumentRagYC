import { prisma } from "../src/config/prisma";

async function main() {
  const doc = await prisma.documentChunk.findFirst();
  console.log("Embedding dimensions:", doc?.embedding?.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
