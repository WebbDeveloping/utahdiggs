import type { CreateListingInput, CoSellerInput, PhotoInput } from "@/types/crm-listing";
import { ListingStatus } from "@/generated/prisma/client";
import type { FullMlsInputValues } from "./validation";

type AddressValue = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
};

type FullnameValue = {
  first?: string;
  last?: string;
};

function formatName(name?: FullnameValue): string {
  if (!name) return "";
  return [name.first, name.last].filter(Boolean).join(" ").trim();
}

function parseAddress(addr?: AddressValue) {
  return {
    address: addr?.street?.trim() || "TBD",
    city: addr?.city?.trim() || "TBD",
    state: addr?.state?.trim().toUpperCase() || "UT",
    zip: addr?.zip?.trim() || "00000",
  };
}

function parsePrice(value?: string): number | undefined {
  if (!value) return undefined;
  const num = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isNaN(num) ? undefined : num;
}

function parseNumber(value?: string | number): number | undefined {
  if (value === undefined || value === "") return undefined;
  const num = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isNaN(num) ? undefined : num;
}

function sumLevelMatrix(values: FullMlsInputValues): { beds: string; baths: string } {
  const matrix = values["q117-2level117"] as
    | Record<string, Record<string, string | string[]>>
    | undefined;
  if (!matrix) return { beds: "", baths: "" };

  let totalBeds = 0;
  let totalFull = 0;
  let totalThreeQuarter = 0;
  let totalHalf = 0;

  for (const row of Object.values(matrix)) {
    const beds = parseInt(String(row.bedrooms ?? "0"), 10);
    if (!Number.isNaN(beds)) totalBeds += beds;
    const full = parseInt(String(row["full-baths"] ?? "0"), 10);
    if (!Number.isNaN(full)) totalFull += full;
    const threeQ = parseInt(String(row["3-4-baths"] ?? "0"), 10);
    if (!Number.isNaN(threeQ)) totalThreeQuarter += threeQ;
    const half = parseInt(String(row["1-2-baths"] ?? "0"), 10);
    if (!Number.isNaN(half)) totalHalf += half;
  }

  const baths = totalFull + totalThreeQuarter * 0.75 + totalHalf * 0.5;
  return {
    beds: totalBeds > 0 ? String(totalBeds) : "",
    baths: baths > 0 ? String(baths) : "",
  };
}

function buildDescription(values: FullMlsInputValues): string | undefined {
  const parts = [
    values["q97-publicremarks"],
    values.hoaRemarks ? `HOA: ${values.hoaRemarks}` : undefined,
    values.exclusionsRemarks ? `Exclusions: ${values.exclusionsRemarks}` : undefined,
    values["q98-commentsto"] ? `Notes to Glide RE: ${values["q98-commentsto"]}` : undefined,
  ].filter(Boolean) as string[];

  const text = parts.join("\n\n").trim();
  return text || undefined;
}

function extractPhotos(values: FullMlsInputValues): PhotoInput[] {
  const fromField = values["field-44"] as Array<{ name: string; url: string }> | undefined;
  const fromPhotos = values.photos;
  const photos = fromPhotos?.length ? fromPhotos : fromField ?? [];
  return photos
    .filter((p) => p.url)
    .map((p) => ({ name: p.name || "Photo", url: p.url }));
}

export function mapMlsIntakeToListingInput(
  values: FullMlsInputValues,
): CreateListingInput {
  const listingAddress = parseAddress(values.listingAddress as AddressValue);
  const primaryName = formatName(values.primaryOwnerName as FullnameValue);
  const { beds, baths } = sumLevelMatrix(values);
  const coSellers: CoSellerInput[] = [];

  if (values.ownerCount === "Two") {
    const secondaryEmail = (values.secondaryOwnerEmail as string | undefined)?.trim();
    if (secondaryEmail) {
      coSellers.push({
        email: secondaryEmail,
        name: formatName(values.secondaryOwnerName as FullnameValue) || secondaryEmail,
        phone: (values.secondaryOwnerPhone as string | undefined)?.trim(),
      });
    }
  }

  return {
    ...listingAddress,
    listPrice: parsePrice(values.listingPrice as string | undefined),
    beds,
    baths,
    sqft: values.livingSqft ? String(values.livingSqft) : undefined,
    yearBuilt: parseNumber(values.yearBuilt as string | undefined),
    lotSizeAcres: parseNumber(values.lotSize as string | undefined),
    hasPool: values["q184-doesthe"] === "Yes",
    description: buildDescription(values),
    subdivision: String(values.projectSubdivision ?? "").trim() || undefined,
    sellerName: primaryName || "Seller",
    sellerEmail: (values.primaryOwnerEmail as string).trim(),
    sellerPhone: (values.primaryOwnerPhone as string).trim(),
    coSellers,
    photos: extractPhotos(values),
    status: ListingStatus.SUBMITTED,
  };
}
