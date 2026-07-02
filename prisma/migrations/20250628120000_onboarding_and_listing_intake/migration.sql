-- Baseline for onboarding, listing intake, and listing search fields.
-- Idempotent: safe when the database was previously synced via `prisma db push`.

DO $$ BEGIN
  CREATE TYPE "ServicePlan" AS ENUM ('VIRTUAL', 'FULL_SERVICE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "OnboardingStatus" AS ENUM (
    'PLAN_PENDING',
    'AGREEMENT_PENDING',
    'PHOTOS_PENDING',
    'CALL_PENDING',
    'MLS_INTAKE_PENDING',
    'ONBOARDING_COMPLETE'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "IntakeStatus" AS ENUM ('DRAFT', 'SUBMITTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "yearBuilt" INTEGER;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "lotSizeAcres" DECIMAL(10, 4);
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "neighborhood" TEXT;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "subdivision" TEXT;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "hasPool" BOOLEAN;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "listingOffice" TEXT;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "virtualTourUrl" TEXT;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "servicePlan" "ServicePlan";
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'PLAN_PENDING';
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "agreementSignedAt" TIMESTAMP(3);
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "agreementSignatureUrl" TEXT;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "proPhotoTourRequested" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "scheduledCallAt" TIMESTAMP(3);
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "callNotes" TEXT;

CREATE INDEX IF NOT EXISTS "Listing_listPrice_idx" ON "Listing"("listPrice");
CREATE INDEX IF NOT EXISTS "Listing_latitude_longitude_idx" ON "Listing"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "Listing_onboardingStatus_idx" ON "Listing"("onboardingStatus");

CREATE TABLE IF NOT EXISTS "ListingIntake" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "status" "IntakeStatus" NOT NULL DEFAULT 'DRAFT',
  "currentStep" INTEGER NOT NULL DEFAULT 1,
  "data" JSONB NOT NULL DEFAULT '{}',
  "signatureUrl" TEXT,
  "submittedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ListingIntake_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ListingIntake_listingId_key" ON "ListingIntake"("listingId");

DO $$ BEGIN
  ALTER TABLE "ListingIntake"
    ADD CONSTRAINT "ListingIntake_listingId_fkey"
    FOREIGN KEY ("listingId") REFERENCES "Listing"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
