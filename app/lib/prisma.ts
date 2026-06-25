// app/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaClientSingleton = () => {
  // Create a connection pool for Postgres
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  // Use the Postgres adapter
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}