-- AlterTable
ALTER TABLE "User" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "assignedAgentId" TEXT;

-- CreateIndex
CREATE INDEX "Listing_assignedAgentId_idx" ON "Listing"("assignedAgentId");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
