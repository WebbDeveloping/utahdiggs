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

import { geocodeAddress } from "../src/lib/geocode";

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
    const query = `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`;
    const coords = await geocodeAddress(query);

    if (!coords) {
      console.warn(`No coordinates found for: ${query}`);
      await sleep(1100);
      continue;
    }

    await prisma.listing.update({
      where: { id: listing.id },
      data: coords,
    });

    console.log(`Updated ${query} → ${coords.latitude}, ${coords.longitude}`);
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
