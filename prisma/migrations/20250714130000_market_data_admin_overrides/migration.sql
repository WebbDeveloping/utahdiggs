-- AlterTable
ALTER TABLE "MarketData" ADD COLUMN "isManualOverride" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: store sold-to-listed as text (e.g. "61:103")
ALTER TABLE "MarketData"
ALTER COLUMN "soldToListedRatio" TYPE TEXT
USING CASE
  WHEN "soldToListedRatio" IS NULL THEN NULL
  ELSE trim(trailing '.' FROM trim(trailing '0' FROM "soldToListedRatio"::TEXT))
END;
