import type { ListingStatus } from "@/generated/prisma/client";

export type CoSellerInput = {
  email: string;
  name?: string;
  phone?: string;
};

export type PhotoInput = {
  name: string;
  url: string;
};

export type CreateListingInput = {
  address: string;
  city: string;
  state: string;
  zip: string;
  listPrice?: number;
  beds?: string;
  baths?: string;
  sqft?: string;
  mlsNumber?: string;
  listDate?: Date;
  yearBuilt?: number;
  lotSizeAcres?: number;
  neighborhood?: string;
  subdivision?: string;
  hasPool?: boolean;
  listingOffice?: string;
  virtualTourUrl?: string;
  description?: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  coSellers: CoSellerInput[];
  escrowOfficerId?: string;
  transactionCoordinatorId?: string;
  photos: PhotoInput[];
  status: ListingStatus;
  portfolioGroup?: string;
};

export type CreateListingFieldErrors = Partial<
  Record<
    | keyof CreateListingInput
    | "coSellers"
    | "photos"
    | `coSellerEmail${number}`
    | `photoName${number}`
    | `photoUrl${number}`,
    string
  >
>;

export type CreateListingState = {
  error?: string;
  fieldErrors?: CreateListingFieldErrors;
};

export type ClosingTeamOption = {
  id: string;
  name: string;
  company: string | null;
};

export type ClosingTeamOptions = {
  escrowOfficers: ClosingTeamOption[];
  transactionCoordinators: ClosingTeamOption[];
};
