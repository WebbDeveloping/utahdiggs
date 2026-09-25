/**
 * Sync Weekly Stats and Market Data from Airtable onto existing Postgres listings.
 * Weekly stats match by MLS# (then street address); market data matches by city.
 * Does not create or update Listing rows.
 *
 * Disabled while this repo points at the live database. See CLAUDE.md.
 */

import "dotenv/config";
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local", override: true });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { syncAirtableData } from "../src/lib/airtable-sync/sync";
import { refuseLiveDatabaseWrite } from "../src/lib/refuse-live-database-write";
import { resolvePostgresUrl } from "../src/lib/postgres-url";

async function main() {
  refuseLiveDatabaseWrite("tsx scripts/sync-airtable.ts");

  const connectionString = resolvePostgresUrl();
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  console.log("Syncing Airtable → Postgres (weekly stats, market data)...");
  const result = await syncAirtableData(prisma);
  console.log(JSON.stringify(result, null, 2));
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
