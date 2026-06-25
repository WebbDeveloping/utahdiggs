import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { resolvePostgresUrl } from "@/lib/postgres-url";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = resolvePostgresUrl();

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set (also checked PRISMA_DATABASE_URL, POSTGRES_URL)",
    );
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;

  // Dev HMR can keep a Prisma client from before a schema change (e.g. missing `customer`).
  if (cached && "customer" in cached) {
    return cached;
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

export const prisma = getPrismaClient();
