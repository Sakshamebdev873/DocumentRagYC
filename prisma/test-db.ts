import { prisma } from "../src/config/prisma";

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, department: true }
  });
  console.log("USERS:");
  console.log(users);

  const chunks = await prisma.documentChunk.findMany({
    select: { text: true, department: true, allowedRole: true }
  });
  console.log("\nCHUNKS:");
  console.log(chunks);
}

main().catch(console.error).finally(() => prisma.$disconnect());
