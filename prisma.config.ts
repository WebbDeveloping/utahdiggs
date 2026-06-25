import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js uses .env.local; Prisma CLI only auto-loads .env — load both.
loadEnv({ path: ".env.local" });
loadEnv();

// Prisma Postgres (db.prisma.io): use DIRECT_URL if set, else DATABASE_URL / PRISMA_DATABASE_URL / POSTGRES_URL
const migrationUrl =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  process.env.PRISMA_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "postgresql://placeholder:placeholder@localhost:5432/utahdigs";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: migrationUrl,
  },
});
