import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local", override: true });
loadEnv();

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ||
    process.env.PRISMA_DATABASE_URL ||
    process.env.POSTGRES_URL,
});

const prisma = new PrismaClient({ adapter });

const UTAH_VIEWBOX = "-114.05,36.99,-109.04,42.01";

async function geocodeAddress(query: string) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "us");
  url.searchParams.set("viewbox", UTAH_VIEWBOX);

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "GlideRE-GeocodeScript/1.0 (contact@glidere.com)",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed with status ${response.status}`);
  }

  const data = (await response.json()) as Array<{ lat: string; lon: string }>;
  if (!data.length) {
    return null;
  }

  return {
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
  };
}

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
