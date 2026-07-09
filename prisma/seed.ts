import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local", override: true });
loadEnv();
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import type { Prisma } from "../src/generated/prisma/client";
import {
  PrismaClient,
  UserRole,
  ClosingTeamRole,
  ContactRole,
  IntakeStatus,
  ListingStatus,
} from "../src/generated/prisma/client";
import { mapMlsIntakeToListingInput } from "../src/lib/mls-input/map-to-listing";
import type { FullMlsInputValues } from "../src/lib/mls-input/validation";
import { resolvePostgresUrl } from "../src/lib/postgres-url";
import {
  copySeedPhotos,
  copySignaturePhoto,
  getAppBaseUrl,
} from "./seed-data/copy-seed-photos";
import {
  MLS_TEST_LISTING_CONFIGS,
  buildMlsTestListingValues,
  validateMlsTestListings,
  type MlsTestListingConfig,
} from "./seed-data/mls-test-listings";

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
    update: { name, passwordHash, role, active: true },
    create: { email: email.toLowerCase(), name, passwordHash, role, active: true },
  });
}

type SeedDeps = {
  escrow: { id: string } | null;
  tc: { id: string } | null;
  testAgent: { id: string } | null;
  seller: { id: string };
  coSeller: { id: string };
  appBaseUrl: string;
};

async function seedMlsTestListing(
  config: MlsTestListingConfig,
  values: FullMlsInputValues,
  signatureUrl: string,
  deps: SeedDeps,
) {
  const input = mapMlsIntakeToListingInput(values);
  const submittedAt = new Date();
  const offerFormUrl = `${deps.appBaseUrl}/offer/${config.listingSlug}`;

  const listingData = {
    address: input.address,
    city: input.city,
    state: input.state,
    zip: input.zip,
    listPrice: input.listPrice ?? null,
    beds: input.beds ?? null,
    baths: input.baths ?? null,
    sqft: input.sqft ?? null,
    yearBuilt: input.yearBuilt ?? null,
    lotSizeAcres: input.lotSizeAcres ?? null,
    hasPool: input.hasPool ?? null,
    description: input.description ?? null,
    mlsNumber: config.mlsNumber,
    status: ListingStatus.SUBMITTED,
    offerFormUrl,
    portfolioGroup: config.portfolioGroup,
    escrowOfficerId: deps.escrow?.id ?? null,
    transactionCoordinatorId: deps.tc?.id ?? null,
    assignedAgentId: deps.testAgent?.id ?? null,
    latitude: config.latitude,
    longitude: config.longitude,
    neighborhood: config.neighborhood,
    subdivision: config.subdivision,
    listingOffice: config.listingOffice,
    listDate: config.listDate,
    submittedAt,
  };

  const listing = await prisma.listing.upsert({
    where: { listingSlug: config.listingSlug },
    update: listingData,
    create: {
      ...listingData,
      listingSlug: config.listingSlug,
    },
  });

  await prisma.listingIntake.upsert({
    where: { listingId: listing.id },
    update: {
      status: IntakeStatus.SUBMITTED,
      currentStep: 16,
      data: values as Prisma.InputJsonValue,
      signatureUrl,
      submittedAt,
    },
    create: {
      listingId: listing.id,
      status: IntakeStatus.SUBMITTED,
      currentStep: 16,
      data: values as Prisma.InputJsonValue,
      signatureUrl,
      submittedAt,
    },
  });

  await prisma.document.deleteMany({ where: { listingId: listing.id } });

  const documents = [
    ...input.photos.map((photo) => ({
      listingId: listing.id,
      name: photo.name.trim(),
      url: photo.url.trim(),
    })),
    {
      listingId: listing.id,
      name: "MLS Input Signature",
      url: signatureUrl,
    },
  ];

  if (documents.length > 0) {
    await prisma.document.createMany({ data: documents });
  }

  await prisma.listingContact.upsert({
    where: {
      listingId_contactId: { listingId: listing.id, contactId: deps.seller.id },
    },
    update: { role: ContactRole.PRIMARY },
    create: {
      listingId: listing.id,
      contactId: deps.seller.id,
      role: ContactRole.PRIMARY,
    },
  });

  if (values.ownerCount === "Two") {
    await prisma.listingContact.upsert({
      where: {
        listingId_contactId: {
          listingId: listing.id,
          contactId: deps.coSeller.id,
        },
      },
      update: { role: ContactRole.CO_SELLER },
      create: {
        listingId: listing.id,
        contactId: deps.coSeller.id,
        role: ContactRole.CO_SELLER,
      },
    });
  }

  return listing;
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
      company: "Glide RE",
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
  await upsertUser("agent@glidere.com", "Test Agent", "agent123", UserRole.AGENT);

  if (process.env.SEED_ADMIN_PASSWORD) {
    await upsertUser(
      process.env.SEED_ADMIN_EMAIL ?? "blair@glidere.com",
      process.env.SEED_ADMIN_NAME ?? "Blair",
      process.env.SEED_ADMIN_PASSWORD,
      UserRole.ADMIN,
    );
  }

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

  const testAgent = await prisma.user.findUnique({
    where: { email: "agent@glidere.com" },
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
    where: { listingSlug: "test-home" },
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
      offerFormUrl: "http://localhost:3000/offer/test-home",
      portfolioGroup: "test-portfolio",
      escrowOfficerId: escrow?.id,
      transactionCoordinatorId: tc?.id,
      assignedAgentId: testAgent?.id ?? null,
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
      listingSlug: "test-home",
      offerFormUrl: "http://localhost:3000/offer/test-home",
      portfolioGroup: "test-portfolio",
      escrowOfficerId: escrow?.id,
      transactionCoordinatorId: tc?.id,
      assignedAgentId: testAgent?.id ?? null,
      ...listingSearchFields,
    },
  });

  const listing2 = await prisma.listing.upsert({
    where: { listingSlug: "test-home-2" },
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
      portfolioGroup: "test-portfolio",
      escrowOfficerId: escrow?.id,
      transactionCoordinatorId: tc?.id,
      assignedAgentId: testAgent?.id ?? null,
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
      listingSlug: "test-home-2",
      portfolioGroup: "test-portfolio",
      escrowOfficerId: escrow?.id,
      transactionCoordinatorId: tc?.id,
      assignedAgentId: testAgent?.id ?? null,
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

  const appBaseUrl = getAppBaseUrl();
  const signature = copySignaturePhoto();
  const mlsSeedInputs = MLS_TEST_LISTING_CONFIGS.map((config) => {
    const { photos, copied, missing } = copySeedPhotos(
      config.listingSlug,
      config.imageNumbers,
    );
    const values = buildMlsTestListingValues(config, photos, signature.url);
    return { config, values, copied, missing };
  });
  const validatedMlsListings = validateMlsTestListings(
    mlsSeedInputs.map(({ config, values }) => ({
      listingSlug: config.listingSlug,
      values,
    })),
  );

  const mlsTestListingIds: string[] = [];
  for (let i = 0; i < MLS_TEST_LISTING_CONFIGS.length; i += 1) {
    const config = MLS_TEST_LISTING_CONFIGS[i];
    const values = validatedMlsListings[i];
    const { copied, missing } = mlsSeedInputs[i];
    const listing = await seedMlsTestListing(config, values, signature.url, {
      escrow,
      tc,
      testAgent,
      seller,
      coSeller,
      appBaseUrl,
    });
    mlsTestListingIds.push(listing.id);
    console.log(
      `MLS test listing seeded: ${config.listingSlug} (${copied} demo photos copied, ${missing} fallback)`,
    );
  }

  console.log("Seed complete.\n");
  console.log("CRM test accounts:");
  console.log("  Admin (main):  Admin@admin.com / admin123");
  console.log("  Agent:         agent@glidere.com / agent123");
  if (process.env.SEED_ADMIN_PASSWORD) {
    console.log(
      `  Blair (env):   ${process.env.SEED_ADMIN_EMAIL} / (SEED_ADMIN_PASSWORD)`,
    );
  }
  console.log("\nSeller account (sign in at /login):");
  console.log("  seller@test.com / password 1234 → /account");
  console.log("  Portfolio listings: test-home through test-home-5");
  console.log("\nMLS-complete test listings (CRM → listing → MLS tab):");
  for (let i = 0; i < MLS_TEST_LISTING_CONFIGS.length; i += 1) {
    const config = MLS_TEST_LISTING_CONFIGS[i];
    console.log(
      `  ${config.listingSlug}: /crm/listings/${mlsTestListingIds[i]} (${config.mlsNumber})`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
