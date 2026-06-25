import type { ListingStatus } from "@/generated/prisma/client";
import type { PhotoInput } from "@/types/crm-listing";

export type ConsumerCreateListingInput = {
  address: string;
  city: string;
  state: string;
  zip: string;
  listPrice?: number;
  beds?: string;
  baths?: string;
  sqft?: string;
  description?: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  photos: PhotoInput[];
};

export type ConsumerCreateListingFieldErrors = Partial<
  Record<
    | keyof ConsumerCreateListingInput
    | "photos"
    | `photoName${number}`
    | `photoUrl${number}`,
    string
  >
>;

export type ConsumerCreateListingState = {
  error?: string;
  fieldErrors?: ConsumerCreateListingFieldErrors;
};

export type CustomerListingSummary = {
  id: string;
  address: string;
  city: string;
  state: string;
  listPrice: string | null;
  status: ListingStatus;
  portalSlug: string;
  primaryPhotoUrl: string | null;
  submittedAt: Date | null;
  createdAt: Date;
};
