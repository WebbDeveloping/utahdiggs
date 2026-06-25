import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local", override: true });
loadEnv();
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  UserRole,
  ClosingTeamRole,
  ContactRole,
  ListingStatus,
} from "../src/generated/prisma/client";
import { resolvePostgresUrl } from "../src/lib/postgres-url";

const connectionString = resolvePostgresUrl();
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

async function upsertUser(
  email: string,
  name: string,
  password: string,
  role: UserRole,
) {
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { name, passwordHash, role },
    create: { email: email.toLowerCase(), name, passwordHash, role },
  });
}

async function main() {
  const closingTeam = [
    {
      airtableRecordId: "rec39Hafyn2Y9Jlla",
      name: "Spencer Steed",
      role: ClosingTeamRole.ESCROW_OFFICER,
      type: "Escrow Officer",
      company: "Title Company",
      phone: "",
      email: "",
      website: "",
    },
    {
      airtableRecordId: "recgsIboMs68c7mg2",
      name: "Erin White",
      role: ClosingTeamRole.TRANSACTION_COORDINATOR,
      type: "Transaction Coordinator",
      company: "Utah Digs",
      phone: "",
      email: "",
      website: "",
    },
  ];

  for (const member of closingTeam) {
    await prisma.closingTeamMember.upsert({
      where: { airtableRecordId: member.airtableRecordId },
      update: member,
      create: member,
    });
  }

  // CRM test accounts (dev/test only — do not use these passwords in production)
  await upsertUser("Admin@admin.com", "Test Admin", "admin123", UserRole.ADMIN);
  await upsertUser("agent@utahdigs.com", "Test Agent", "agent123", UserRole.AGENT);

  if (process.env.SEED_ADMIN_PASSWORD) {
    await upsertUser(
      process.env.SEED_ADMIN_EMAIL ?? "blair@utahdigs.com",
      process.env.SEED_ADMIN_NAME ?? "Blair",
      process.env.SEED_ADMIN_PASSWORD,
      UserRole.ADMIN,
    );
  }

  const passcodeHash = await bcrypt.hash("1234", 10);

  const seller = await prisma.contact.upsert({
    where: { email: "seller@test.com" },
    update: { name: "Test Seller", phone: "8015551234" },
    create: {
      name: "Test Seller",
      email: "seller@test.com",
      phone: "8015551234",
    },
  });

  const coSeller = await prisma.contact.upsert({
    where: { email: "coseller@test.com" },
    update: { name: "Test Co-Seller", phone: "8015555678" },
    create: {
      name: "Test Co-Seller",
      email: "coseller@test.com",
      phone: "8015555678",
    },
  });

  const escrow = await prisma.closingTeamMember.findFirst({
    where: { role: ClosingTeamRole.ESCROW_OFFICER },
  });
  const tc = await prisma.closingTeamMember.findFirst({
    where: { role: ClosingTeamRole.TRANSACTION_COORDINATOR },
  });

  const listingSearchFields = {
    latitude: 40.7608,
    longitude: -111.891,
    yearBuilt: 1998,
    lotSizeAcres: 0.18,
    neighborhood: "Downtown",
    subdivision: "Capitol Hill",
    hasPool: false,
    listingOffice: "Glide RE",
    description:
      "Updated home in downtown Salt Lake City with open living spaces, a remodeled kitchen, and easy access to city amenities.",
    listDate: new Date("2025-11-01"),
  };

  const listing2SearchFields = {
    latitude: 40.7614,
    longitude: -111.873,
    yearBuilt: 2005,
    lotSizeAcres: 0.24,
    neighborhood: "Sugar House",
    subdivision: "Forest Dale",
    hasPool: true,
    listingOffice: "Glide RE",
    virtualTourUrl: "https://example.com/virtual-tour/test-home-2",
    description:
      "Spacious Sugar House home featuring a bright primary suite, finished basement, and a private backyard with pool.",
    listDate: new Date("2025-10-15"),
  };

  const listing = await prisma.listing.upsert({
    where: { portalSlug: "test-home" },
    update: {
      address: "123 Test Street",
      city: "Salt Lake City",
      state: "UT",
      zip: "84101",
      listPrice: 525000,
      beds: "4",
      baths: "3",
      sqft: "2400",
      mlsNumber: "TEST-001",
      status: ListingStatus.ACTIVE,
      passcodeHash,
      offerFormUrl: "http://localhost:3000/offer/test-home",
      portfolioGroup: "test-portfolio",
      escrowOfficerId: escrow?.id,
      transactionCoordinatorId: tc?.id,
      ...listingSearchFields,
    },
    create: {
      address: "123 Test Street",
      city: "Salt Lake City",
      state: "UT",
      zip: "84101",
      listPrice: 525000,
      beds: "4",
      baths: "3",
      sqft: "2400",
      mlsNumber: "TEST-001",
      status: ListingStatus.ACTIVE,
      portalSlug: "test-home",
      passcodeHash,
      offerFormUrl: "http://localhost:3000/offer/test-home",
      portfolioGroup: "test-portfolio",
      escrowOfficerId: escrow?.id,
      transactionCoordinatorId: tc?.id,
      ...listingSearchFields,
    },
  });

  const listing2 = await prisma.listing.upsert({
    where: { portalSlug: "test-home-2" },
    update: {
      address: "456 Demo Avenue",
      city: "Salt Lake City",
      state: "UT",
      zip: "84102",
      listPrice: 675000,
      beds: "5",
      baths: "4",
      sqft: "3100",
      mlsNumber: "TEST-002",
      status: ListingStatus.ACTIVE,
      passcodeHash,
      portfolioGroup: "test-portfolio",
      escrowOfficerId: escrow?.id,
      transactionCoordinatorId: tc?.id,
      ...listing2SearchFields,
    },
    create: {
      address: "456 Demo Avenue",
      city: "Salt Lake City",
      state: "UT",
      zip: "84102",
      listPrice: 675000,
      beds: "5",
      baths: "4",
      sqft: "3100",
      mlsNumber: "TEST-002",
      status: ListingStatus.ACTIVE,
      portalSlug: "test-home-2",
      passcodeHash,
      portfolioGroup: "test-portfolio",
      escrowOfficerId: escrow?.id,
      transactionCoordinatorId: tc?.id,
      ...listing2SearchFields,
    },
  });

  const photoSeed = [
    {
      listingId: listing.id,
      name: "Front exterior",
      url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
    },
    {
      listingId: listing.id,
      name: "Living room",
      url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    },
    {
      listingId: listing2.id,
      name: "Front exterior",
      url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    },
    {
      listingId: listing2.id,
      name: "Kitchen",
      url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  for (const photo of photoSeed) {
    const existing = await prisma.document.findFirst({
      where: { listingId: photo.listingId, name: photo.name },
    });
    if (existing) {
      await prisma.document.update({
        where: { id: existing.id },
        data: { url: photo.url },
      });
    } else {
      await prisma.document.create({ data: photo });
    }
  }

  for (const [listingId, contactId, role] of [
    [listing.id, seller.id, ContactRole.PRIMARY],
    [listing.id, coSeller.id, ContactRole.CO_SELLER],
  ] as const) {
    await prisma.listingContact.upsert({
      where: { listingId_contactId: { listingId, contactId } },
      update: { role },
      create: { listingId, contactId, role },
    });
  }

  const listing2Record = listing2;
  if (listing2Record) {
    await prisma.listingContact.upsert({
      where: {
        listingId_contactId: { listingId: listing2Record.id, contactId: seller.id },
      },
      update: { role: ContactRole.PRIMARY },
      create: {
        listingId: listing2Record.id,
        contactId: seller.id,
        role: ContactRole.PRIMARY,
      },
    });
  }

  console.log("Seed complete.\n");
  console.log("CRM test accounts:");
  console.log("  Admin (main):  Admin@admin.com / admin123");
  console.log("  Agent:         agent@utahdigs.com / agent123");
  if (process.env.SEED_ADMIN_PASSWORD) {
    console.log(
      `  Blair (env):   ${process.env.SEED_ADMIN_EMAIL} / (SEED_ADMIN_PASSWORD)`,
    );
  }
  console.log("\nPortal test accounts (passcode = last 4 of phone, or 1234):");
  console.log("  Primary:   seller@test.com / passcode 1234 → /portal/test-home");
  console.log("  Co-seller: coseller@test.com / passcode 1234 → /portal/test-home");
  console.log("  Portfolio: seller@test.com / passcode 1234 → listings test-home + test-home-2");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
