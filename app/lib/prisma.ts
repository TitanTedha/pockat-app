// app/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// 1. Pass ONLY the URL object directly to the adapter. 
// Do NOT initialize better-sqlite3 yourself!
const adapter = new PrismaBetterSqlite3({ 
  url: "file:./dev.db" 
});

// 2. Safeguard to prevent Next.js from spawning duplicate client instances
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;