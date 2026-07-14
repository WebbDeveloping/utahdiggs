/**
 * One-time Airtable → Postgres import for Phase 6 cutover.
 *
 * Usage:
 *   AIRTABLE_API_KEY=... AIRTABLE_BASE_ID=... DATABASE_URL=... npx tsx scripts/import-airtable.ts
 *
 * Tables are imported in FK order. airtableRecordId columns on Postgres models
 * map Airtable record IDs for traceability during cutover.
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { normalizePostgresUrl } from "../src/lib/postgres-url";
import {
  PrismaClient,
  ContactRole,
  ListingStatus,
  OfferStatus,
  SellerRequestStatus,
  ClosingTeamRole,
} from "../src/generated/prisma/client";

const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_API_KEY;

const TABLE_IDS = {
  sellers: "tblBoQZZbkGpIe5V7",
  listings: "tbltohB45hwmmGjE3",
  showings: "tblgQQizi4zE22L7q",
  weeklyStats: "tbl7xNeeU3QOj88ds",
  offers: "tblrkfPpQYHWoURZf",
  marketData: "tblY3CYT2e6mkOjey",
  sellerRequests: "tblLccmOrodONrfJs",
  closingTeam: "tblLAcvvjwPRcWa7G",
} as const;

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

type AirtableResponse = {
  records: AirtableRecord[];
  offset?: string;
};

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

async function fetchAllRecords(tableId: string): Promise<AirtableRecord[]> {
  const baseId = requireEnv("AIRTABLE_BASE_ID", AIRTABLE_BASE);
  const token = requireEnv("AIRTABLE_API_KEY", AIRTABLE_TOKEN);

  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`);
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Airtable fetch failed (${tableId}): ${res.status}`);
    }

    const data = (await res.json()) as AirtableResponse;
    records.push(...data.records);
    offset = data.offset;
  } while (offset);

  return records;
}

function asString(value: unknown): string | undefined {
  if (value == null) return undefined;
  return String(value);
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return undefined;
}

function asDate(value: unknown): Date | undefined {
  const s = asString(value);
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function linkedIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object" && "id" in item) {
      return String((item as { id: string }).id);
    }
    return "";
  }).filter(Boolean);
}

function mapListingStatus(value: unknown): ListingStatus {
  const normalized = asString(value)?.toUpperCase().replace(/\s+/g, "_");
  switch (normalized) {
    case "UNDER_CONTRACT":
      return ListingStatus.UNDER_CONTRACT;
    case "PENDING":
      return ListingStatus.PENDING;
    case "CLOSED":
      return ListingStatus.CLOSED;
    case "CANCELLED":
      return ListingStatus.CANCELLED;
    default:
      return ListingStatus.ACTIVE;
  }
}

function mapOfferStatus(value: unknown): OfferStatus {
  const normalized = asString(value)?.toUpperCase().replace(/\s+/g, "_");
  switch (normalized) {
    case "ACCEPTED":
      return OfferStatus.ACCEPTED;
    case "DECLINED":
      return OfferStatus.DECLINED;
    case "EXPIRED":
      return OfferStatus.EXPIRED;
    case "CANCELLED":
      return OfferStatus.CANCELLED;
    default:
      return OfferStatus.PENDING_REVIEW;
  }
}

function mapClosingTeamRole(value: unknown): ClosingTeamRole {
  const role = asString(value)?.toLowerCase() ?? "";
  if (role.includes("transaction")) {
    return ClosingTeamRole.TRANSACTION_COORDINATOR;
  }
  return ClosingTeamRole.ESCROW_OFFICER;
}

async function main() {
  const connectionString = normalizePostgresUrl(
    requireEnv("DATABASE_URL", process.env.DATABASE_URL),
  );
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  const listingIdMap = new Map<string, string>();
  const listingAddressMap = new Map<string, string>();
  const contactIdMap = new Map<string, string>();
  const closingTeamIdMap = new Map<string, string>();

  console.log("Importing closing team...");
  for (const record of await fetchAllRecords(TABLE_IDS.closingTeam)) {
    const f = record.fields;
    const member = await prisma.closingTeamMember.upsert({
      where: { airtableRecordId: record.id },
      update: {
        name: asString(f["Name"]) ?? "Unknown",
        role: mapClosingTeamRole(f["Role"]),
        type: asString(f["Type"]),
        company: asString(f["Company"]),
        phone: asString(f["Phone"]),
        email: asString(f["Email"]),
        website: asString(f["Website"]),
      },
      create: {
        airtableRecordId: record.id,
        name: asString(f["Name"]) ?? "Unknown",
        role: mapClosingTeamRole(f["Role"]),
        type: asString(f["Type"]),
        company: asString(f["Company"]),
        phone: asString(f["Phone"]),
        email: asString(f["Email"]),
        website: asString(f["Website"]),
      },
    });
    closingTeamIdMap.set(record.id, member.id);
  }

  console.log("Importing contacts (sellers)...");
  for (const record of await fetchAllRecords(TABLE_IDS.sellers)) {
    const f = record.fields;
    const email = asString(f["Email"])?.toLowerCase();
    if (!email) continue;

    const contact = await prisma.contact.upsert({
      where: { email },
      update: {
        airtableRecordId: record.id,
        name: asString(f["Name"]) ?? email,
        phone: asString(f["Phone"]) ?? "",
      },
      create: {
        airtableRecordId: record.id,
        name: asString(f["Name"]) ?? email,
        email,
        phone: asString(f["Phone"]) ?? "",
      },
    });
    contactIdMap.set(record.id, contact.id);
  }

  console.log("Importing listings...");
  for (const record of await fetchAllRecords(TABLE_IDS.listings)) {
    const f = record.fields;
    const listingSlug = asString(f["Portal Slug"]);
    if (!listingSlug) continue;

    const escrowIds = linkedIds(f["Escrow Officer"]);
    const tcIds = linkedIds(f["Transaction Coordinator"]);

    const listing = await prisma.listing.upsert({
      where: { airtableRecordId: record.id },
      update: {
        address: asString(f["Address"]) ?? "",
        city: asString(f["City"]) ?? "",
        state: asString(f["State"]) ?? "",
        zip: asString(f["Zip"]) ?? "",
        listPrice: asNumber(f["List Price"]),
        beds: asString(f["Beds"]),
        baths: asString(f["Baths"]),
        sqft: asString(f["Sqft"]),
        mlsNumber: asString(f["MLS Number"]),
        listDate: asDate(f["List Date"]),
        status: mapListingStatus(f["Status"]),
        listingSlug,
        offerFormUrl: asString(f["Offer Form URL"]),
        blairNote: asString(f["Blair Note"]),
        blairNoteDate: asDate(f["Blair Note Date"]),
        latestViews: asNumber(f["Latest Views"]),
        latestSaves: asNumber(f["Latest Saves"]),
        latestShowings: asNumber(f["Latest Showings"]),
        priceReductionDate: asDate(f["Price Reduction Date"]),
        priceReductionCount: asNumber(f["Price Reduction Count"]) ?? 0,
        activeOffers: asNumber(f["Active Offers"]) ?? 0,
        marketAvgDom: asNumber(f["Market Avg DOM"]),
        portfolioGroup: asString(f["Portfolio Group"]),
        escrowOfficerId: escrowIds[0]
          ? closingTeamIdMap.get(escrowIds[0])
          : undefined,
        transactionCoordinatorId: tcIds[0]
          ? closingTeamIdMap.get(tcIds[0])
          : undefined,
      },
      create: {
        airtableRecordId: record.id,
        address: asString(f["Address"]) ?? "",
        city: asString(f["City"]) ?? "",
        state: asString(f["State"]) ?? "",
        zip: asString(f["Zip"]) ?? "",
        listPrice: asNumber(f["List Price"]),
        beds: asString(f["Beds"]),
        baths: asString(f["Baths"]),
        sqft: asString(f["Sqft"]),
        mlsNumber: asString(f["MLS Number"]),
        listDate: asDate(f["List Date"]),
        status: mapListingStatus(f["Status"]),
        listingSlug,
        offerFormUrl: asString(f["Offer Form URL"]),
        blairNote: asString(f["Blair Note"]),
        blairNoteDate: asDate(f["Blair Note Date"]),
        latestViews: asNumber(f["Latest Views"]),
        latestSaves: asNumber(f["Latest Saves"]),
        latestShowings: asNumber(f["Latest Showings"]),
        priceReductionDate: asDate(f["Price Reduction Date"]),
        priceReductionCount: asNumber(f["Price Reduction Count"]) ?? 0,
        activeOffers: asNumber(f["Active Offers"]) ?? 0,
        marketAvgDom: asNumber(f["Market Avg DOM"]),
        portfolioGroup: asString(f["Portfolio Group"]),
        escrowOfficerId: escrowIds[0]
          ? closingTeamIdMap.get(escrowIds[0])
          : undefined,
        transactionCoordinatorId: tcIds[0]
          ? closingTeamIdMap.get(tcIds[0])
          : undefined,
      },
    });

    listingIdMap.set(record.id, listing.id);
    const addressKey = (asString(f["Address"]) ?? "").trim().toLowerCase();
    if (addressKey) {
      listingAddressMap.set(addressKey, listing.id);
    }

    const sellerIds = linkedIds(f["Sellers"]);
    for (const [index, sellerAirtableId] of sellerIds.entries()) {
      const contactId = contactIdMap.get(sellerAirtableId);
      if (!contactId) continue;

      await prisma.listingContact.upsert({
        where: {
          listingId_contactId: { listingId: listing.id, contactId },
        },
        update: {
          role: index === 0 ? ContactRole.PRIMARY : ContactRole.CO_SELLER,
        },
        create: {
          listingId: listing.id,
          contactId,
          role: index === 0 ? ContactRole.PRIMARY : ContactRole.CO_SELLER,
        },
      });
    }

    const coSellerEmails = [
      asString(f["Co-Seller 1 Email"]),
      asString(f["Co-Seller 2 Email"]),
      asString(f["Co-Seller 3 Email"]),
    ].filter(Boolean) as string[];

    for (const coEmail of coSellerEmails) {
      const email = coEmail.toLowerCase();
      const contact = await prisma.contact.upsert({
        where: { email },
        update: { name: email },
        create: { name: email, email, phone: "" },
      });

      await prisma.listingContact.upsert({
        where: {
          listingId_contactId: { listingId: listing.id, contactId: contact.id },
        },
        update: { role: ContactRole.CO_SELLER },
        create: {
          listingId: listing.id,
          contactId: contact.id,
          role: ContactRole.CO_SELLER,
        },
      });
    }
  }

  console.log("Importing showings...");
  for (const record of await fetchAllRecords(TABLE_IDS.showings)) {
    const f = record.fields;
    const listingAirtableId = linkedIds(f["Listing"])[0];
    const listingId = listingAirtableId
      ? listingIdMap.get(listingAirtableId)
      : undefined;
    if (!listingId || !asDate(f["Showing Date"])) continue;

    await prisma.showing.upsert({
      where: { airtableRecordId: record.id },
      update: {
        listingId,
        showingDate: asDate(f["Showing Date"])!,
        showingTime: asString(f["Showing Time"]),
        showingLabel: asString(f["Showing Label"]),
        buyersAgent: asString(f["Buyer's Agent"]),
        feedback: asString(f["Feedback"]),
      },
      create: {
        airtableRecordId: record.id,
        listingId,
        showingDate: asDate(f["Showing Date"])!,
        showingTime: asString(f["Showing Time"]),
        showingLabel: asString(f["Showing Label"]),
        buyersAgent: asString(f["Buyer's Agent"]),
        feedback: asString(f["Feedback"]),
      },
    });
  }

  console.log("Importing weekly stats...");
  for (const record of await fetchAllRecords(TABLE_IDS.weeklyStats)) {
    const f = record.fields;
    const listingAirtableId = linkedIds(f["Listing"])[0];
    const listingId = listingAirtableId
      ? listingIdMap.get(listingAirtableId)
      : undefined;
    const weekEnding = asDate(f["Week Ending"]);
    if (!listingId || !weekEnding) continue;

    await prisma.weeklyStat.upsert({
      where: {
        listingId_weekEnding: { listingId, weekEnding },
      },
      update: {
        airtableRecordId: record.id,
        listtracTotal30d: asNumber(f["Listtrac Total (30d)"]),
        ureViews30d: asNumber(f["URE Views (30d)"]),
        zillowViews30d: asNumber(f["Zillow Views (30d)"]),
        realtorViews30d: asNumber(f["Realtor.com Views (30d)"]),
        homesViews30d: asNumber(f["Homes.com Views (30d)"]),
        truliaViews30d: asNumber(f["Trulia Views (30d)"]),
        ureFavoritesCumulative: asNumber(f["URE Favorites (cumulative)"]),
        lifetimeViews: asNumber(f["Lifetime Views"]),
      },
      create: {
        airtableRecordId: record.id,
        listingId,
        weekEnding,
        listtracTotal30d: asNumber(f["Listtrac Total (30d)"]),
        ureViews30d: asNumber(f["URE Views (30d)"]),
        zillowViews30d: asNumber(f["Zillow Views (30d)"]),
        realtorViews30d: asNumber(f["Realtor.com Views (30d)"]),
        homesViews30d: asNumber(f["Homes.com Views (30d)"]),
        truliaViews30d: asNumber(f["Trulia Views (30d)"]),
        ureFavoritesCumulative: asNumber(f["URE Favorites (cumulative)"]),
        lifetimeViews: asNumber(f["Lifetime Views"]),
      },
    });
  }

  console.log("Importing offers...");
  for (const record of await fetchAllRecords(TABLE_IDS.offers)) {
    const f = record.fields;
    const listingAirtableId = linkedIds(f["Listing"])[0];
    const listingId = listingAirtableId
      ? listingIdMap.get(listingAirtableId)
      : undefined;
    if (!listingId) continue;

    await prisma.offer.upsert({
      where: { airtableRecordId: record.id },
      update: {
        listingId,
        submittedDate: asDate(f["Submitted Date"]) ?? new Date(),
        offerPrice: asNumber(f["Offer Price"]),
        buyersAgent: asString(f["Buyer's Agent"]),
        financingType: asString(f["Financing Type"]),
        status: mapOfferStatus(f["Status"]),
        contractPrice: asNumber(f["Contract Price"]),
        settlementDate: asDate(f["Settlement Date"]),
        sellerConcessions: asString(f["Seller Concessions"]),
        buyerDueDiligenceDeadline: asDate(f["Buyer Due Diligence Deadline"]),
        homeWarranty: asString(f["Home Warranty"]),
        financingAppraisalDeadline: asDate(f["Financing/Appraisal Deadline"]),
        sellerDisclosureDeadline: asDate(f["Seller Disclosure Deadline"]),
      },
      create: {
        airtableRecordId: record.id,
        listingId,
        submittedDate: asDate(f["Submitted Date"]) ?? new Date(),
        offerPrice: asNumber(f["Offer Price"]),
        buyersAgent: asString(f["Buyer's Agent"]),
        financingType: asString(f["Financing Type"]),
        status: mapOfferStatus(f["Status"]),
        contractPrice: asNumber(f["Contract Price"]),
        settlementDate: asDate(f["Settlement Date"]),
        sellerConcessions: asString(f["Seller Concessions"]),
        buyerDueDiligenceDeadline: asDate(f["Buyer Due Diligence Deadline"]),
        homeWarranty: asString(f["Home Warranty"]),
        financingAppraisalDeadline: asDate(f["Financing/Appraisal Deadline"]),
        sellerDisclosureDeadline: asDate(f["Seller Disclosure Deadline"]),
      },
    });
  }

  console.log("Importing market data...");
  for (const record of await fetchAllRecords(TABLE_IDS.marketData)) {
    const f = record.fields;
    const city = asString(f["City"]);
    const reportDate = asDate(f["Report Date"]);
    if (!city || !reportDate) continue;

    const existing = await prisma.marketData.findUnique({
      where: { city_reportDate: { city, reportDate } },
      select: { isManualOverride: true },
    });
    if (existing?.isManualOverride) continue;

    const marketData = {
      airtableRecordId: record.id,
      homesForSale: asNumber(f["Homes For Sale"]),
      homesForSaleChangePct: asNumber(f["Homes For Sale Change Pct"]),
      newToMarket: asNumber(f["New To Market"]),
      newToMarketChangePct: asNumber(f["New To Market Change Pct"]),
      homesSoldCount: asNumber(f["Homes Sold Count"]),
      homesSoldChangePct: asNumber(f["Homes Sold Change Pct"]),
      avgDom: asNumber(f["Avg DOM"]),
      domChangePct: asNumber(f["DOM Change Pct"]),
      avgHomePrice: asNumber(f["Avg Home Price"]),
      avgHomePriceChangePct: asNumber(f["Avg Home Price Change Pct"]),
      avgSoldPrice: asNumber(f["Avg Sold Price"]),
      avgSoldPriceChangePct: asNumber(f["Avg Sold Price Change Pct"]),
      pricePerSqFt: asNumber(f["Price Per Sq Ft"]),
      pricePerSqFtChangePct: asNumber(f["Price Per Sq Ft Change Pct"]),
      priceReductionsCount: asNumber(f["Price Reductions Count"]),
      priceReductionsChangePct: asNumber(f["Price Reductions Change Pct"]),
      soldToListedRatio: asString(f["Sold To Listed Ratio"]),
      soldToListedChangePct: asNumber(f["Sold To Listed Change Pct"]),
      isManualOverride: false,
    };

    await prisma.marketData.upsert({
      where: { city_reportDate: { city, reportDate } },
      update: marketData,
      create: {
        ...marketData,
        city,
        reportDate,
      },
    });
  }

  console.log("Importing seller requests...");
  for (const record of await fetchAllRecords(TABLE_IDS.sellerRequests)) {
    const f = record.fields;
    const propertyAddress = (asString(f["Property Address"]) ?? "").trim().toLowerCase();
    const listingId = propertyAddress
      ? listingAddressMap.get(propertyAddress)
      : undefined;

    if (!listingId) {
      console.warn(`Skipping seller request ${record.id}: listing not found`);
      continue;
    }

    await prisma.sellerRequest.upsert({
      where: { airtableRecordId: record.id },
      update: {
        listingId,
        sellerName: asString(f["Seller Name"]) ?? "",
        sellerEmail: asString(f["Seller Email"]) ?? "",
        propertyAddress: asString(f["Property Address"]) ?? "",
        submittedAt: asDate(f["Submitted"]) ?? new Date(),
        status: SellerRequestStatus.NEW,
        requestSummary: asString(f["Request Summary"]),
        updateTypes: Array.isArray(f["Update Types"])
          ? (f["Update Types"] as string[])
          : [],
        message: asString(f["Message"]),
        openHouseDate: asDate(f["Open House Date/Time"]),
        openHouseTime: asString(f["Open House Date/Time"]),
      },
      create: {
        airtableRecordId: record.id,
        listingId,
        sellerName: asString(f["Seller Name"]) ?? "",
        sellerEmail: asString(f["Seller Email"]) ?? "",
        propertyAddress: asString(f["Property Address"]) ?? "",
        submittedAt: asDate(f["Submitted"]) ?? new Date(),
        status: SellerRequestStatus.NEW,
        requestSummary: asString(f["Request Summary"]),
        updateTypes: Array.isArray(f["Update Types"])
          ? (f["Update Types"] as string[])
          : [],
        message: asString(f["Message"]),
        openHouseDate: asDate(f["Open House Date/Time"]),
        openHouseTime: asString(f["Open House Date/Time"]),
      },
    });
  }

  console.log("Import complete.");
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
