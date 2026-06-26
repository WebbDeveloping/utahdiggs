import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local", override: true });
loadEnv();

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { resolvePostgresUrl } from "../src/lib/postgres-url";

const connectionString = resolvePostgresUrl();
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

import { geocodeListingAddress } from "../src/lib/geocode";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const listings = await prisma.listing.findMany({
    where: {
      OR: [{ latitude: null }, { longitude: null }],
    },
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      zip: true,
    },
  });

  if (listings.length === 0) {
    console.log("All listings already have coordinates.");
    return;
  }

  console.log(`Geocoding ${listings.length} listing(s)...`);

  for (const listing of listings) {
    const coords = await geocodeListingAddress({
      address: listing.address,
      city: listing.city,
      state: listing.state,
      zip: listing.zip,
    });

    if (!coords) {
      console.warn(
        `No coordinates found for: ${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`,
      );
      await sleep(1100);
      continue;
    }

    await prisma.listing.update({
      where: { id: listing.id },
      data: coords,
    });

    console.log(
      `Updated ${listing.address}, ${listing.city} → ${coords.latitude}, ${coords.longitude}`,
    );
    await sleep(1100);
  }

  console.log("Geocoding complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
