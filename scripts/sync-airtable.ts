/**
 * Sync Listings, Weekly Stats, and Market Data from the duplicate Airtable base.
 *
 * Usage:
 *   npm run sync:airtable
 */

import "dotenv/config";
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local", override: true });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { syncAirtableData } from "../src/lib/airtable-sync/sync";
import { resolvePostgresUrl } from "../src/lib/postgres-url";

async function main() {
  const connectionString = resolvePostgresUrl();
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  console.log("Syncing Airtable → Postgres (listings, weekly stats, market data)...");
  const result = await syncAirtableData(prisma);
  console.log(JSON.stringify(result, null, 2));
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
