import type { Prisma } from "@/generated/prisma/client";
import { IntakeStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { mapIntakeToPropertyDetails } from "@/lib/search/map-intake-to-property-details";
import { normalizeCoordinate } from "@/lib/search/format";
import { PUBLIC_LISTING_STATUSES } from "@/lib/search/search-params";
import type {
  PublicListing,
  PublicListingDetail,
  SearchFilters,
  SearchSort,
} from "@/types/public-listing";

type ListingWithDocuments = Prisma.ListingGetPayload<{
  include: { documents: { orderBy: { uploadedAt: "asc" }; take: 1 } };
}>;

type ListingWithAllDocuments = Prisma.ListingGetPayload<{
  include: {
    documents: { orderBy: { uploadedAt: "asc" } };
    assignedAgent: { select: { name: true; email: true; image: true; active: true } };
    listingIntake: { select: { data: true; status: true } };
  };
}>;

function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseNumericString(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = parseFloat(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toPublicListing(listing: ListingWithDocuments): PublicListing {
  return {
    id: listing.id,
    address: listing.address,
    city: listing.city,
    state: listing.state,
    zip: listing.zip,
    listPrice: listing.listPrice ? Number(listing.listPrice) : null,
    beds: listing.beds,
    baths: listing.baths,
    sqft: listing.sqft,
    lotSizeAcres: listing.lotSizeAcres ? Number(listing.lotSizeAcres) : null,
    yearBuilt: listing.yearBuilt,
    status: listing.status,
    mlsNumber: listing.mlsNumber,
    latitude: normalizeCoordinate(listing.latitude),
    longitude: normalizeCoordinate(listing.longitude),
    primaryPhotoUrl: listing.documents[0]?.url ?? null,
    virtualTourUrl: listing.virtualTourUrl,
    listingOffice: listing.listingOffice,
    portalSlug: listing.portalSlug,
    listDate: listing.listDate?.toISOString().slice(0, 10) ?? null,
    neighborhood: listing.neighborhood,
    subdivision: listing.subdivision,
    hasPool: listing.hasPool,
    description: listing.description,
  };
}

function sortListings(listings: PublicListing[], sort: SearchSort): PublicListing[] {
  const sorted = [...listings];

  sorted.sort((a, b) => {
    switch (sort) {
      case "date-desc":
        return (b.listDate ?? "").localeCompare(a.listDate ?? "");
      case "date-asc":
        return (a.listDate ?? "").localeCompare(b.listDate ?? "");
      case "price-desc":
        return (b.listPrice ?? 0) - (a.listPrice ?? 0);
      case "price-asc":
        return (a.listPrice ?? 0) - (b.listPrice ?? 0);
      case "size-desc":
        return parseNumericString(b.sqft) - parseNumericString(a.sqft);
      case "size-asc":
        return parseNumericString(a.sqft) - parseNumericString(b.sqft);
      case "beds-desc":
        return parseNumericString(b.beds) - parseNumericString(a.beds);
      case "beds-asc":
        return parseNumericString(a.beds) - parseNumericString(b.beds);
      case "baths-desc":
        return parseNumericString(b.baths) - parseNumericString(a.baths);
      case "baths-asc":
        return parseNumericString(a.baths) - parseNumericString(b.baths);
      case "year-desc":
        return (b.yearBuilt ?? 0) - (a.yearBuilt ?? 0);
      case "year-asc":
        return (a.yearBuilt ?? 0) - (b.yearBuilt ?? 0);
      default:
        return 0;
    }
  });

  return sorted;
}

function parseBbox(
  bbox: string,
): { west: number; south: number; east: number; north: number } | null {
  const parts = bbox.split(",").map(Number);
  if (parts.length !== 4 || !parts.every(Number.isFinite)) return null;

  const [west, south, east, north] = parts;
  return { west, south, east, north };
}

function buildWhere(filters: SearchFilters): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = {
    status: { in: [...PUBLIC_LISTING_STATUSES] },
  };

  const andConditions: Prisma.ListingWhereInput[] = [];

  if (filters.text?.trim()) {
    const text = filters.text.trim();
    andConditions.push({
      OR: [
        { address: { contains: text, mode: "insensitive" } },
        { city: { contains: text, mode: "insensitive" } },
        { zip: { contains: text, mode: "insensitive" } },
        { neighborhood: { contains: text, mode: "insensitive" } },
        { subdivision: { contains: text, mode: "insensitive" } },
      ],
    });
  }

  const bounds = filters.bbox ? parseBbox(filters.bbox) : null;
  if (bounds) {
    // Keep listings without coordinates visible in results; only filter geocoded
    // listings that fall outside the current map viewport.
    andConditions.push({
      OR: [
        { latitude: null },
        { longitude: null },
        {
          latitude: { gte: bounds.south, lte: bounds.north },
          longitude: { gte: bounds.west, lte: bounds.east },
        },
      ],
    });
  }

  const minPrice = parseNumber(filters.minPrice);
  const maxPrice = parseNumber(filters.maxPrice);
  if (minPrice !== undefined || maxPrice !== undefined) {
    andConditions.push({
      listPrice: {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
      },
    });
  }

  const minBeds = parseNumber(filters.minBeds);
  if (minBeds !== undefined) {
    andConditions.push({
      beds: { not: null },
    });
  }

  const minBaths = parseNumber(filters.minBaths);
  if (minBaths !== undefined) {
    andConditions.push({
      baths: { not: null },
    });
  }

  if (filters.zip?.trim()) {
    andConditions.push({ zip: { contains: filters.zip.trim(), mode: "insensitive" } });
  }

  if (filters.state?.trim()) {
    andConditions.push({ state: { equals: filters.state.trim(), mode: "insensitive" } });
  }

  if (filters.neighborhood?.trim()) {
    andConditions.push({
      neighborhood: { contains: filters.neighborhood.trim(), mode: "insensitive" },
    });
  }

  if (filters.subdivision?.trim()) {
    andConditions.push({
      subdivision: { contains: filters.subdivision.trim(), mode: "insensitive" },
    });
  }

  if (filters.keyword?.trim()) {
    const keyword = filters.keyword.trim();
    andConditions.push({
      OR: [
        { description: { contains: keyword, mode: "insensitive" } },
        { address: { contains: keyword, mode: "insensitive" } },
        { neighborhood: { contains: keyword, mode: "insensitive" } },
      ],
    });
  }

  if (filters.mlsNumber?.trim()) {
    andConditions.push({
      mlsNumber: { contains: filters.mlsNumber.trim(), mode: "insensitive" },
    });
  }

  if (filters.hasPool === "true") {
    andConditions.push({ hasPool: true });
  } else if (filters.hasPool === "false") {
    andConditions.push({ hasPool: false });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  return where;
}

export async function searchListings(filters: SearchFilters) {
  const page = Math.max(1, parseNumber(filters.page) ?? 1);
  const limit = Math.min(100, Math.max(1, parseNumber(filters.limit) ?? 24));
  const sort = filters.sort ?? "date-desc";
  const where = buildWhere(filters);

  const listings = await prisma.listing.findMany({
    where,
    include: {
      documents: {
        orderBy: { uploadedAt: "asc" },
        take: 1,
      },
    },
  });

  let publicListings = listings.map(toPublicListing);

  const minBeds = parseNumber(filters.minBeds);
  if (minBeds !== undefined) {
    publicListings = publicListings.filter(
      (listing) => parseNumericString(listing.beds) >= minBeds,
    );
  }

  const minBaths = parseNumber(filters.minBaths);
  if (minBaths !== undefined) {
    publicListings = publicListings.filter(
      (listing) => parseNumericString(listing.baths) >= minBaths,
    );
  }

  publicListings = sortListings(publicListings, sort);

  const total = publicListings.length;
  const start = (page - 1) * limit;
  const paginated = publicListings.slice(start, start + limit);

  return {
    listings: paginated,
    total,
    page,
    limit,
  };
}

export async function getPublicListingBySlug(
  slug: string,
): Promise<PublicListingDetail | null> {
  const listing = await prisma.listing.findFirst({
    where: {
      portalSlug: slug,
      status: { in: [...PUBLIC_LISTING_STATUSES] },
    },
    include: {
      documents: {
        orderBy: { uploadedAt: "asc" },
      },
      assignedAgent: {
        select: { name: true, email: true, image: true, active: true },
      },
      listingIntake: {
        select: { data: true, status: true },
      },
    },
  });

  if (!listing) return null;

  const base = toPublicListing(listing as ListingWithAllDocuments);
  const agent = listing.assignedAgent;
  const intake = listing.listingIntake;
  const intakeData =
    intake?.status === IntakeStatus.SUBMITTED && intake.data && typeof intake.data === "object"
      ? (intake.data as Record<string, unknown>)
      : null;
  const propertyDetails = intakeData
    ? mapIntakeToPropertyDetails(intakeData, {
        yearBuilt: base.yearBuilt,
        listingOffice: base.listingOffice,
      })
    : [];

  return {
    ...base,
    photos: listing.documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      url: doc.url,
    })),
    assignedAgent:
      agent?.active && agent.email
        ? {
            name: agent.name,
            email: agent.email,
            image: agent.image,
          }
        : null,
    propertyDetails,
  };
}
