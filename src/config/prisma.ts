import { PrismaClient } from "../../generated/prisma";

declare const globalThis: { prisma?: PrismaClient } & typeof global;

export const prisma = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
