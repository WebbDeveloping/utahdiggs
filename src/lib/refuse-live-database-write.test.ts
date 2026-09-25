import assert from "node:assert/strict";
import test from "node:test";
import {
  blockedPrismaInvocation,
  isLiveDatabaseUrl,
  liveWriteBlockReason,
} from "./refuse-live-database-write";

const liveUrl =
  "postgres://user:secret@db.prisma.io:5432/postgres?sslmode=verify-full";

test("treats db.prisma.io as the live database", () => {
  assert.equal(isLiveDatabaseUrl(liveUrl), true);
  assert.equal(
    isLiveDatabaseUrl("postgres://user:secret@localhost:5432/glidere"),
    false,
  );
  assert.equal(isLiveDatabaseUrl(undefined), false);
});

test("refuses a missing database and the live database", () => {
  assert.match(liveWriteBlockReason(undefined) ?? "", /disabled/);
  assert.match(liveWriteBlockReason(liveUrl) ?? "", /live production database/);
  assert.equal(
    liveWriteBlockReason("postgres://user:secret@localhost:5432/glidere"),
    null,
  );
});

test("blocks prisma commands that write production data", () => {
  assert.equal(
    blockedPrismaInvocation(["node", "/prisma/build/index.js", "migrate", "dev"]),
    "prisma migrate",
  );
  assert.equal(
    blockedPrismaInvocation(["node", "/prisma/build/index.js", "db", "seed"]),
    "prisma db seed",
  );
  assert.equal(
    blockedPrismaInvocation(["node", "/prisma/build/index.js", "db", "push"]),
    "prisma db push",
  );
  assert.equal(
    blockedPrismaInvocation(["node", "/prisma/build/index.js", "db", "execute"]),
    "prisma db execute",
  );
  assert.equal(
    blockedPrismaInvocation(["node", "/prisma/build/index.js", "studio"]),
    "prisma studio",
  );
});

test("allows prisma generate and validate", () => {
  assert.equal(
    blockedPrismaInvocation(["node", "/prisma/build/index.js", "generate"]),
    null,
  );
  assert.equal(
    blockedPrismaInvocation(["node", "/prisma/build/index.js", "validate"]),
    null,
  );
});
