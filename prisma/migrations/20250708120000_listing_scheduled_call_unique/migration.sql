-- CreateIndex
CREATE INDEX "Listing_scheduledCallAt_idx" ON "Listing"("scheduledCallAt");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_scheduledCallAt_key" ON "Listing"("scheduledCallAt");
