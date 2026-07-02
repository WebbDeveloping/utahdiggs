-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "SignatureMethod" AS ENUM ('DRAW', 'TYPE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "AgreementSignature" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "signerName" TEXT NOT NULL,
    "signerEmail" TEXT NOT NULL,
    "signatureMethod" "SignatureMethod" NOT NULL,
    "signatureImageUrl" TEXT NOT NULL,
    "signedDocumentUrl" TEXT,
    "agreementVersion" TEXT NOT NULL,
    "agreementHash" TEXT NOT NULL,
    "esignConsentAt" TIMESTAMP(3) NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "AgreementSignature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AgreementSignature_listingId_key" ON "AgreementSignature"("listingId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AgreementSignature_customerId_idx" ON "AgreementSignature"("customerId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "AgreementSignature"
    ADD CONSTRAINT "AgreementSignature_listingId_fkey"
    FOREIGN KEY ("listingId") REFERENCES "Listing"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "AgreementSignature"
    ADD CONSTRAINT "AgreementSignature_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
