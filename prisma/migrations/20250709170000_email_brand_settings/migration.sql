-- CreateTable
CREATE TABLE "EmailBrandSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "primaryColor" TEXT NOT NULL DEFAULT '#1a3a5c',
    "pageBackground" TEXT NOT NULL DEFAULT '#F1F5F9',
    "cardBackground" TEXT NOT NULL DEFAULT '#ffffff',
    "bodyTextColor" TEXT NOT NULL DEFAULT '#1E293B',
    "mutedTextColor" TEXT NOT NULL DEFAULT '#64748B',
    "linkColor" TEXT NOT NULL DEFAULT '#1a3a5c',
    "accentBackground" TEXT NOT NULL DEFAULT '#EFF6FF',
    "buttonRadius" TEXT NOT NULL DEFAULT '10px',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailBrandSettings_pkey" PRIMARY KEY ("id")
);

-- Seed default brand settings row
INSERT INTO "EmailBrandSettings" ("id", "primaryColor", "pageBackground", "cardBackground", "bodyTextColor", "mutedTextColor", "linkColor", "accentBackground", "buttonRadius", "updatedAt")
VALUES ('default', '#1a3a5c', '#F1F5F9', '#ffffff', '#1E293B', '#64748B', '#1a3a5c', '#EFF6FF', '10px', CURRENT_TIMESTAMP);
