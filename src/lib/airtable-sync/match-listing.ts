export type AirtableListingLookup = {
  mlsNumber: string | null;
  address: string;
  city: string;
};

export type PostgresListingMatchRow = {
  id: string;
  mlsNumber: string | null;
  address: string;
  city: string;
};

export type ListingMatchIndexes = {
  byMls: Map<string, string | "ambiguous">;
  byStreetCity: Map<string, string[]>;
};

export type ListingMatchResult =
  | { listingId: string; method: "mls" | "address" }
  | { listingId: null; method: null };

/** Extract street portion before first comma (Airtable often stores full "street, city, ST zip"). */
export function streetFromAddress(address: string): string {
  const trimmed = address.trim();
  const comma = trimmed.indexOf(",");
  if (comma === -1) return trimmed;
  return trimmed.slice(0, comma).trim();
}

export function normalizeCity(city: string): string {
  return city
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ");
}

export function normalizeStreet(address: string): string {
  let street = streetFromAddress(address).toLowerCase().trim();

  // Normalize common unit tokens before stripping punctuation
  street = street
    .replace(/\bapt\.?\b/g, " unit ")
    .replace(/\bapartment\b/g, " unit ")
    .replace(/\bsuite\b/g, " unit ")
    .replace(/\bste\.?\b/g, " unit ")
    .replace(/#/g, " unit ");

  street = street
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return street;
}

export function streetCityKey(address: string, city: string): string {
  return `${normalizeStreet(address)}|${normalizeCity(city)}`;
}

/** Parse leading MLS digits from Week Label like "2138751 — Jun 19, 2026". */
export function parseMlsFromWeekLabel(weekLabel: string | undefined): string | null {
  if (!weekLabel) return null;
  const match = weekLabel.trim().match(/^(\d+)\b/);
  return match?.[1] ?? null;
}

export function buildListingMatchIndexes(
  listings: PostgresListingMatchRow[],
): ListingMatchIndexes {
  const byMls = new Map<string, string | "ambiguous">();
  const byStreetCity = new Map<string, string[]>();

  for (const listing of listings) {
    const mls = listing.mlsNumber?.trim();
    if (mls) {
      const existing = byMls.get(mls);
      if (existing && existing !== listing.id) {
        byMls.set(mls, "ambiguous");
      } else if (!existing) {
        byMls.set(mls, listing.id);
      }
    }

    const key = streetCityKey(listing.address, listing.city);
    if (!key.startsWith("|") && !key.endsWith("|")) {
      const ids = byStreetCity.get(key) ?? [];
      ids.push(listing.id);
      byStreetCity.set(key, ids);
    }
  }

  return { byMls, byStreetCity };
}

export function resolveListingId(
  indexes: ListingMatchIndexes,
  airtableListing: AirtableListingLookup | undefined,
  weekLabelMls: string | null,
): ListingMatchResult {
  const mlsCandidates = [
    airtableListing?.mlsNumber?.trim() || null,
    weekLabelMls,
  ].filter((value): value is string => Boolean(value));

  const triedMls = new Set<string>();
  for (const mls of mlsCandidates) {
    if (triedMls.has(mls)) continue;
    triedMls.add(mls);

    const hit = indexes.byMls.get(mls);
    if (hit === "ambiguous") {
      // Duplicate MLS in Postgres — do not guess; try next candidate if any.
      continue;
    }
    if (hit) {
      return { listingId: hit, method: "mls" };
    }
  }

  if (!airtableListing) {
    return { listingId: null, method: null };
  }

  const key = streetCityKey(airtableListing.address, airtableListing.city);
  const addressHits = indexes.byStreetCity.get(key) ?? [];
  if (addressHits.length === 1) {
    return { listingId: addressHits[0]!, method: "address" };
  }

  return { listingId: null, method: null };
}
