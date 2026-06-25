-- CreateEnum
CREATE TYPE "SellInquiryStatus" AS ENUM ('NEW', 'LISTING_STARTED', 'LISTING_SUBMITTED');

-- CreateTable
CREATE TABLE "SellInquiry" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "streetAddress" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "status" "SellInquiryStatus" NOT NULL DEFAULT 'NEW',
    "listingId" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SellInquiry_email_idx" ON "SellInquiry"("email");

-- CreateIndex
CREATE INDEX "SellInquiry_customerId_idx" ON "SellInquiry"("customerId");

-- CreateIndex
CREATE INDEX "SellInquiry_status_idx" ON "SellInquiry"("status");

-- AddForeignKey
ALTER TABLE "SellInquiry" ADD CONSTRAINT "SellInquiry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellInquiry" ADD CONSTRAINT "SellInquiry_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
