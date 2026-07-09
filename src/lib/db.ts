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

function modelFieldNames(
  client: PrismaClient,
  modelName: string,
): Set<string> | null {
  const fields = (
    client as unknown as {
      _runtimeDataModel?: {
        models?: Record<string, { fields?: Array<{ name: string }> }>;
      };
    }
  )._runtimeDataModel?.models?.[modelName]?.fields;

  if (!Array.isArray(fields)) {
    return null;
  }

  return new Set(fields.map((field) => field.name));
}

function isCachedPrismaClientValid(client: PrismaClient): boolean {
  if (
    !(
      "customer" in client &&
      "agreementSignature" in client &&
      "emailBrandSettings" in client
    )
  ) {
    return false;
  }

  // Portal PIN auth removed; stale HMR clients still expose portalSession.
  if ("portalSession" in client) {
    return false;
  }

  const agreementSignatureFields = modelFieldNames(client, "AgreementSignature");
  if (!agreementSignatureFields?.has("formData")) {
    return false;
  }

  const listingFields = modelFieldNames(client, "Listing");
  return (
    (listingFields?.has("listingSlug") ?? false) &&
    !listingFields?.has("portalSlug")
  );
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;

  // Dev HMR can keep a Prisma client from before a schema change (missing delegates/fields).
  if (cached && isCachedPrismaClientValid(cached)) {
    return cached;
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

export const prisma = getPrismaClient();
