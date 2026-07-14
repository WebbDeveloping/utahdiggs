-- CreateTable
CREATE TABLE "MlsOpsSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "defaultVaUserId" TEXT,
    "fallbackEmail" TEXT,
    "preferAssignedAgent" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MlsOpsSettings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MlsOpsSettings" ADD CONSTRAINT "MlsOpsSettings_defaultVaUserId_fkey" FOREIGN KEY ("defaultVaUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed default settings row
INSERT INTO "MlsOpsSettings" ("id", "defaultVaUserId", "fallbackEmail", "preferAssignedAgent", "updatedAt")
VALUES ('default', NULL, NULL, false, CURRENT_TIMESTAMP);
