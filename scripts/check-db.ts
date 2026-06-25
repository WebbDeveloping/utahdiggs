import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local", override: true });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { resolvePostgresUrl } from "../src/lib/postgres-url";

async function main() {
  const connectionString = resolvePostgresUrl();

  if (!connectionString) {
    console.error("No DATABASE_URL configured");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  const [users, closingTeam, listings, contacts] = await Promise.all([
    prisma.user.count(),
    prisma.closingTeamMember.count(),
    prisma.listing.count(),
    prisma.contact.count(),
  ]);

  console.log(
    JSON.stringify(
      {
        ok: true,
        database: "connected",
        host: "db.prisma.io",
        counts: { users, closingTeam, listings, contacts },
      },
      null,
      2,
    ),
  );

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: String(err) }));
  process.exit(1);
});
