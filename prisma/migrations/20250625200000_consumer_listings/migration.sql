-- AlterEnum
ALTER TYPE "ListingStatus" ADD VALUE 'SUBMITTED' BEFORE 'ACTIVE';

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "customerId" TEXT;
ALTER TABLE "Listing" ADD COLUMN "submittedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Listing_customerId_idx" ON "Listing"("customerId");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
