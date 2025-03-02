import { PrismaClient } from "@prisma/client";

// Disable ESLint's no-var rule for this block
/* eslint-disable no-var */
declare global {
  var prisma: PrismaClient | undefined;
}
/* eslint-enable no-var */

const prisma = globalThis.prisma || new PrismaClient();

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
