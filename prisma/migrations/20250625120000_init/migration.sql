-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'AGENT');

-- CreateEnum
CREATE TYPE "ContactRole" AS ENUM ('PRIMARY', 'CO_SELLER');

-- CreateEnum
CREATE TYPE "ClosingTeamRole" AS ENUM ('ESCROW_OFFICER', 'TRANSACTION_COORDINATOR');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'UNDER_CONTRACT', 'PENDING', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING_REVIEW', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SellerRequestStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EmailLogStatus" AS ENUM ('SENT', 'FAILED', 'PENDING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'AGENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "airtableRecordId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalSession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingContact" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "role" "ContactRole" NOT NULL DEFAULT 'PRIMARY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClosingTeamMember" (
    "id" TEXT NOT NULL,
    "airtableRecordId" TEXT,
    "name" TEXT NOT NULL,
    "role" "ClosingTeamRole" NOT NULL,
    "type" TEXT,
    "company" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClosingTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "airtableRecordId" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "listPrice" DECIMAL(12,2),
    "beds" TEXT,
    "baths" TEXT,
    "sqft" TEXT,
    "mlsNumber" TEXT,
    "listDate" DATE,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "portalSlug" TEXT NOT NULL,
    "passcodeHash" TEXT NOT NULL,
    "offerFormUrl" TEXT,
    "blairNote" TEXT,
    "blairNoteDate" DATE,
    "latestViews" INTEGER,
    "latestSaves" INTEGER,
    "latestShowings" INTEGER,
    "priceReductionDate" DATE,
    "priceReductionCount" INTEGER NOT NULL DEFAULT 0,
    "activeOffers" INTEGER NOT NULL DEFAULT 0,
    "marketAvgDom" INTEGER,
    "portfolioGroup" TEXT,
    "escrowOfficerId" TEXT,
    "transactionCoordinatorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Showing" (
    "id" TEXT NOT NULL,
    "airtableRecordId" TEXT,
    "listingId" TEXT NOT NULL,
    "showingDate" DATE NOT NULL,
    "showingTime" TEXT,
    "showingLabel" TEXT,
    "buyersAgent" TEXT,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Showing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyStat" (
    "id" TEXT NOT NULL,
    "airtableRecordId" TEXT,
    "listingId" TEXT NOT NULL,
    "weekEnding" DATE NOT NULL,
    "listtracTotal30d" INTEGER,
    "ureViews30d" INTEGER,
    "zillowViews30d" INTEGER,
    "realtorViews30d" INTEGER,
    "homesViews30d" INTEGER,
    "truliaViews30d" INTEGER,
    "ureFavoritesCumulative" INTEGER,
    "lifetimeViews" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "airtableRecordId" TEXT,
    "listingId" TEXT NOT NULL,
    "submittedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "offerPrice" DECIMAL(12,2),
    "buyersAgent" TEXT,
    "financingType" TEXT,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "contractPrice" DECIMAL(12,2),
    "settlementDate" DATE,
    "sellerConcessions" TEXT,
    "buyerDueDiligenceDeadline" DATE,
    "homeWarranty" TEXT,
    "financingAppraisalDeadline" DATE,
    "sellerDisclosureDeadline" DATE,
    "buyerName" TEXT,
    "buyerEmail" TEXT,
    "buyerPhone" TEXT,
    "buyerAgentEmail" TEXT,
    "buyerAgentPhone" TEXT,
    "earnestMoney" DECIMAL(12,2),
    "closingDate" DATE,
    "inspectionPeriod" TEXT,
    "appraisalGap" TEXT,
    "contingencies" TEXT,
    "additionalTerms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferDocument" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfferDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketData" (
    "id" TEXT NOT NULL,
    "airtableRecordId" TEXT,
    "city" TEXT NOT NULL,
    "reportDate" DATE NOT NULL,
    "homesForSale" INTEGER,
    "homesForSaleChangePct" DECIMAL(8,4),
    "newToMarket" INTEGER,
    "newToMarketChangePct" DECIMAL(8,4),
    "homesSoldCount" INTEGER,
    "homesSoldChangePct" DECIMAL(8,4),
    "avgDom" INTEGER,
    "domChangePct" DECIMAL(8,4),
    "avgHomePrice" DECIMAL(14,2),
    "avgHomePriceChangePct" DECIMAL(8,4),
    "avgSoldPrice" DECIMAL(14,2),
    "avgSoldPriceChangePct" DECIMAL(8,4),
    "pricePerSqFt" DECIMAL(10,2),
    "pricePerSqFtChangePct" DECIMAL(8,4),
    "priceReductionsCount" INTEGER,
    "priceReductionsChangePct" DECIMAL(8,4),
    "soldToListedRatio" DECIMAL(8,4),
    "soldToListedChangePct" DECIMAL(8,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerRequest" (
    "id" TEXT NOT NULL,
    "airtableRecordId" TEXT,
    "listingId" TEXT NOT NULL,
    "contactId" TEXT,
    "sellerName" TEXT NOT NULL,
    "sellerEmail" TEXT NOT NULL,
    "propertyAddress" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SellerRequestStatus" NOT NULL DEFAULT 'NEW',
    "requestSummary" TEXT,
    "updateTypes" TEXT[],
    "message" TEXT,
    "openHouseDate" DATE,
    "openHouseTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedByContactId" TEXT,
    "uploadedByUserId" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "template" TEXT,
    "subject" TEXT,
    "status" "EmailLogStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_airtableRecordId_key" ON "Contact"("airtableRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_email_key" ON "Contact"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PortalSession_token_key" ON "PortalSession"("token");

-- CreateIndex
CREATE INDEX "PortalSession_token_idx" ON "PortalSession"("token");

-- CreateIndex
CREATE INDEX "PortalSession_contactId_idx" ON "PortalSession"("contactId");

-- CreateIndex
CREATE INDEX "ListingContact_contactId_idx" ON "ListingContact"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingContact_listingId_contactId_key" ON "ListingContact"("listingId", "contactId");

-- CreateIndex
CREATE UNIQUE INDEX "ClosingTeamMember_airtableRecordId_key" ON "ClosingTeamMember"("airtableRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_airtableRecordId_key" ON "Listing"("airtableRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_portalSlug_key" ON "Listing"("portalSlug");

-- CreateIndex
CREATE INDEX "Listing_city_idx" ON "Listing"("city");

-- CreateIndex
CREATE INDEX "Listing_portfolioGroup_idx" ON "Listing"("portfolioGroup");

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "Listing"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Showing_airtableRecordId_key" ON "Showing"("airtableRecordId");

-- CreateIndex
CREATE INDEX "Showing_listingId_showingDate_idx" ON "Showing"("listingId", "showingDate");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyStat_airtableRecordId_key" ON "WeeklyStat"("airtableRecordId");

-- CreateIndex
CREATE INDEX "WeeklyStat_listingId_idx" ON "WeeklyStat"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyStat_listingId_weekEnding_key" ON "WeeklyStat"("listingId", "weekEnding");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_airtableRecordId_key" ON "Offer"("airtableRecordId");

-- CreateIndex
CREATE INDEX "Offer_listingId_submittedDate_idx" ON "Offer"("listingId", "submittedDate");

-- CreateIndex
CREATE INDEX "Offer_status_idx" ON "Offer"("status");

-- CreateIndex
CREATE INDEX "OfferDocument_offerId_idx" ON "OfferDocument"("offerId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketData_airtableRecordId_key" ON "MarketData"("airtableRecordId");

-- CreateIndex
CREATE INDEX "MarketData_city_idx" ON "MarketData"("city");

-- CreateIndex
CREATE UNIQUE INDEX "MarketData_city_reportDate_key" ON "MarketData"("city", "reportDate");

-- CreateIndex
CREATE UNIQUE INDEX "SellerRequest_airtableRecordId_key" ON "SellerRequest"("airtableRecordId");

-- CreateIndex
CREATE INDEX "SellerRequest_listingId_idx" ON "SellerRequest"("listingId");

-- CreateIndex
CREATE INDEX "SellerRequest_status_idx" ON "SellerRequest"("status");

-- CreateIndex
CREATE INDEX "Document_listingId_idx" ON "Document"("listingId");

-- CreateIndex
CREATE INDEX "EmailLog_trigger_idx" ON "EmailLog"("trigger");

-- CreateIndex
CREATE INDEX "EmailLog_status_idx" ON "EmailLog"("status");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalSession" ADD CONSTRAINT "PortalSession_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalSession" ADD CONSTRAINT "PortalSession_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingContact" ADD CONSTRAINT "ListingContact_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingContact" ADD CONSTRAINT "ListingContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_escrowOfficerId_fkey" FOREIGN KEY ("escrowOfficerId") REFERENCES "ClosingTeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_transactionCoordinatorId_fkey" FOREIGN KEY ("transactionCoordinatorId") REFERENCES "ClosingTeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Showing" ADD CONSTRAINT "Showing_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyStat" ADD CONSTRAINT "WeeklyStat_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferDocument" ADD CONSTRAINT "OfferDocument_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerRequest" ADD CONSTRAINT "SellerRequest_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerRequest" ADD CONSTRAINT "SellerRequest_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedByContactId_fkey" FOREIGN KEY ("uploadedByContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
