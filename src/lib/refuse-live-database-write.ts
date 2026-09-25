import { resolvePostgresUrl } from "./postgres-url";

/** Prisma Postgres host used for production. Local dev points at this same database. */
export const LIVE_DATABASE_HOST = "db.prisma.io";

const BLOCKED_DB_SUBCOMMANDS = new Set(["push", "seed", "execute"]);

export function isLiveDatabaseUrl(connectionString: string | undefined): boolean {
  if (!connectionString) return false;

  try {
    return new URL(connectionString).hostname === LIVE_DATABASE_HOST;
  } catch {
    return connectionString.includes(`@${LIVE_DATABASE_HOST}`);
  }
}

/**
 * Reason these writes are disabled, or null when the URL is some other database.
 * A missing URL is still a refusal: this repo has no development database.
 */
export function liveWriteBlockReason(
  connectionString: string | undefined,
): string | null {
  if (!connectionString) {
    return "No development database is configured. This command writes data and is disabled.";
  }

  if (isLiveDatabaseUrl(connectionString)) {
    return `DATABASE_URL points at the live production database (${LIVE_DATABASE_HOST}). This command is disabled.`;
  }

  return null;
}

/** Prisma CLI args that change the live database. `generate` and `validate` are not included. */
export function blockedPrismaInvocation(argv: readonly string[]): string | null {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "migrate") return "prisma migrate";
    if (arg === "studio") return "prisma studio";
    if (arg === "db") {
      const sub = argv[i + 1];
      if (sub && BLOCKED_DB_SUBCOMMANDS.has(sub)) return `prisma db ${sub}`;
    }
  }

  return null;
}

export function refuseLiveDatabaseWrite(
  command: string,
  connectionString: string | undefined = resolvePostgresUrl(),
): void {
  const reason = liveWriteBlockReason(connectionString);
  if (!reason) return;

  console.error(`Refusing to run ${command}.`);
  console.error(reason);
  console.error(
    "Do not retry this command, do not re-add it, and do not weaken this check. Local work must not change production.",
  );
  process.exit(1);
}
