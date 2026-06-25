// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // In Prisma 7, the migration engine needs the direct/stable connection
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
  datasource: {
    // This is the connection your application (client) will use
    url: process.env["DATABASE_URL"],
  },
});