-- AlterTable
ALTER TABLE "SellerRequest" ADD COLUMN IF NOT EXISTS "currentPrice" DECIMAL(12,2);
ALTER TABLE "SellerRequest" ADD COLUMN IF NOT EXISTS "newPrice" DECIMAL(12,2);
ALTER TABLE "SellerRequest" ADD COLUMN IF NOT EXISTS "reductionOption" TEXT;
