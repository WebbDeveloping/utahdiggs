import type { ListingStatus } from "@/generated/prisma/client";

export type PublicListingStatus = ListingStatus;

export type PublicListing = {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  listPrice: number | null;
  beds: string | null;
  baths: string | null;
  sqft: string | null;
  lotSizeAcres: number | null;
  yearBuilt: number | null;
  status: PublicListingStatus;
  mlsNumber: string | null;
  latitude: number | null;
  longitude: number | null;
  primaryPhotoUrl: string | null;
  virtualTourUrl: string | null;
  listingOffice: string | null;
  portalSlug: string;
  listDate: string | null;
  neighborhood: string | null;
  subdivision: string | null;
  hasPool: boolean | null;
  description: string | null;
};

export type PublicListingDetail = PublicListing & {
  photos: { id: string; name: string; url: string }[];
};

export type SearchSort =
  | "date-desc"
  | "date-asc"
  | "price-desc"
  | "price-asc"
  | "size-desc"
  | "size-asc"
  | "beds-desc"
  | "beds-asc"
  | "baths-desc"
  | "baths-asc"
  | "year-desc"
  | "year-asc";

export type SearchFilters = {
  text?: string;
  bbox?: string;
  minPrice?: string;
  maxPrice?: string;
  minBeds?: string;
  minBaths?: string;
  zip?: string;
  state?: string;
  neighborhood?: string;
  subdivision?: string;
  keyword?: string;
  mlsNumber?: string;
  hasPool?: string;
  sort?: SearchSort;
  page?: string;
  limit?: string;
};

export type SearchListingsResponse = {
  listings: PublicListing[];
  total: number;
  page: number;
  limit: number;
};

export type GeocodeResult = {
  lat: number;
  lng: number;
  bbox: [number, number, number, number];
  displayName: string;
};
