const LEGACY_SSL_MODES = new Set(["prefer", "require", "verify-ca"]);

/** pg v8 warns when sslmode is an alias for verify-full; normalize to silence it. */
export function normalizePostgresUrl(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get("sslmode");

    if (sslmode && LEGACY_SSL_MODES.has(sslmode)) {
      url.searchParams.set("sslmode", "verify-full");
      return url.toString();
    }

    return connectionString;
  } catch {
    return connectionString;
  }
}

export function resolvePostgresUrl(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const connectionString =
    env.DATABASE_URL || env.PRISMA_DATABASE_URL || env.POSTGRES_URL;

  return connectionString
    ? normalizePostgresUrl(connectionString)
    : undefined;
}
