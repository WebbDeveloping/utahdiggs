"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ListingStatus } from "@/generated/prisma/client";
import { auth } from "@/lib/auth/admin-auth";
import { canManageListings } from "@/lib/auth/roles";
import { createListing } from "@/lib/crm/create-listing";
import { geocodeAddress } from "@/lib/geocode";
import { prisma } from "@/lib/db";
import { MAX_PHOTO_COUNT } from "@/lib/storage/blob";
import type {
  CoSellerInput,
  CreateListingFieldErrors,
  CreateListingInput,
  CreateListingState,
  PhotoInput,
} from "@/types/crm-listing";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseOptionalNumber(
  value: string,
  field: keyof CreateListingFieldErrors,
  errors: CreateListingFieldErrors,
): number | undefined {
  if (!value) return undefined;
  const num = Number(value.replace(/,/g, ""));
  if (Number.isNaN(num)) {
    errors[field] = "Enter a valid number.";
    return undefined;
  }
  return num;
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isValidPhotoUrl(value: string): boolean {
  return isValidUrl(value);
}

function parseFormData(formData: FormData): {
  input: CreateListingInput;
  fieldErrors: CreateListingFieldErrors;
} {
  const fieldErrors: CreateListingFieldErrors = {};

  const address = asString(formData.get("address"));
  const city = asString(formData.get("city"));
  const state = asString(formData.get("state"));
  const zip = asString(formData.get("zip"));

  const sellerName = asString(formData.get("sellerName"));
  const sellerEmail = asString(formData.get("sellerEmail"));
  const sellerPhone = asString(formData.get("sellerPhone"));

  if (!address) fieldErrors.address = "Address is required.";
  if (!city) fieldErrors.city = "City is required.";
  if (!state) fieldErrors.state = "State is required.";
  else if (!/^[A-Za-z]{2}$/.test(state)) {
    fieldErrors.state = "Enter a 2-letter state code.";
  }
  if (!zip) fieldErrors.zip = "Zip is required.";

  if (!sellerName) fieldErrors.sellerName = "Seller name is required.";
  if (!sellerEmail) fieldErrors.sellerEmail = "Seller email is required.";
  else if (!EMAIL_RE.test(sellerEmail)) {
    fieldErrors.sellerEmail = "Enter a valid email address.";
  }
  if (!sellerPhone) fieldErrors.sellerPhone = "Seller phone is required.";
  else if (sellerPhone.replace(/\D/g, "").length < 4) {
    fieldErrors.sellerPhone = "Phone must have at least 4 digits for the portal PIN.";
  }

  const listPrice = parseOptionalNumber(
    asString(formData.get("listPrice")),
    "listPrice",
    fieldErrors,
  );
  const yearBuilt = parseOptionalNumber(
    asString(formData.get("yearBuilt")),
    "yearBuilt",
    fieldErrors,
  );
  const lotSizeAcres = parseOptionalNumber(
    asString(formData.get("lotSizeAcres")),
    "lotSizeAcres",
    fieldErrors,
  );

  const listDateRaw = asString(formData.get("listDate"));
  let listDate: Date | undefined;
  if (listDateRaw) {
    const parsed = new Date(listDateRaw);
    if (Number.isNaN(parsed.getTime())) {
      fieldErrors.listDate = "Enter a valid date.";
    } else {
      listDate = parsed;
    }
  }

  const virtualTourUrl = asString(formData.get("virtualTourUrl"));
  if (virtualTourUrl && !isValidUrl(virtualTourUrl)) {
    fieldErrors.virtualTourUrl = "Enter a valid URL.";
  }

  const statusRaw = asString(formData.get("status")) || ListingStatus.ACTIVE;
  const status = Object.values(ListingStatus).includes(statusRaw as ListingStatus)
    ? (statusRaw as ListingStatus)
    : ListingStatus.ACTIVE;

  const coSellers: CoSellerInput[] = [];
  const seenEmails = new Set<string>([sellerEmail.toLowerCase()]);

  for (let i = 0; i < 3; i++) {
    const email = asString(formData.get(`coSellerEmail${i}`));
    if (!email) continue;

    const key = `coSellerEmail${i}` as const;
    if (!EMAIL_RE.test(email)) {
      fieldErrors[key] = "Enter a valid email address.";
      continue;
    }
    const normalized = email.toLowerCase();
    if (seenEmails.has(normalized)) {
      fieldErrors[key] = "Duplicate email.";
      continue;
    }
    seenEmails.add(normalized);

    coSellers.push({
      email,
      name: asString(formData.get(`coSellerName${i}`)) || undefined,
      phone: asString(formData.get(`coSellerPhone${i}`)) || undefined,
    });
  }

  const photos: PhotoInput[] = [];
  const photoCount = Number(asString(formData.get("photoCount")) || "0");

  if (photoCount > MAX_PHOTO_COUNT) {
    fieldErrors.photos = `A listing can have at most ${MAX_PHOTO_COUNT} photos.`;
  }

  for (let i = 0; i < photoCount; i++) {
    const name = asString(formData.get(`photoName${i}`));
    const url = asString(formData.get(`photoUrl${i}`));
    if (!name && !url) continue;

    if (!name) {
      fieldErrors[`photoName${i}`] = "Photo name is required when a file is uploaded.";
    }
    if (!url) {
      fieldErrors[`photoUrl${i}`] = "Upload the photo before creating the listing.";
    } else if (!isValidPhotoUrl(url)) {
      fieldErrors[`photoUrl${i}`] = "Enter a valid photo URL.";
    }

    if (name && url && isValidPhotoUrl(url)) {
      photos.push({ name, url });
    }
  }

  if (photos.length > MAX_PHOTO_COUNT) {
    fieldErrors.photos = `A listing can have at most ${MAX_PHOTO_COUNT} photos.`;
  }

  const input: CreateListingInput = {
    address,
    city,
    state,
    zip,
    listPrice,
    beds: asString(formData.get("beds")) || undefined,
    baths: asString(formData.get("baths")) || undefined,
    sqft: asString(formData.get("sqft")) || undefined,
    mlsNumber: asString(formData.get("mlsNumber")) || undefined,
    listDate,
    yearBuilt,
    lotSizeAcres,
    neighborhood: asString(formData.get("neighborhood")) || undefined,
    subdivision: asString(formData.get("subdivision")) || undefined,
    hasPool: formData.get("hasPool") === "on",
    listingOffice: asString(formData.get("listingOffice")) || undefined,
    virtualTourUrl: virtualTourUrl || undefined,
    description: asString(formData.get("description")) || undefined,
    sellerName,
    sellerEmail,
    sellerPhone,
    coSellers,
    escrowOfficerId: asString(formData.get("escrowOfficerId")) || undefined,
    transactionCoordinatorId:
      asString(formData.get("transactionCoordinatorId")) || undefined,
    photos,
    status,
    portfolioGroup: asString(formData.get("portfolioGroup")) || undefined,
  };

  return { input, fieldErrors };
}

export async function createListingAction(
  _prev: CreateListingState,
  formData: FormData,
): Promise<CreateListingState> {
  const session = await auth();
  if (!session?.user?.id || !canManageListings(session.user.role)) {
    return { error: "You are not authorized to create listings." };
  }

  const { input, fieldErrors } = parseFormData(formData);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  let result;
  try {
    result = await createListing(input, { userId: session.user.id });
  } catch (error) {
    console.error("createListingAction failed:", error);
    return { error: "Failed to create listing. Please try again." };
  }

  redirect(
    `/crm/listings?created=${encodeURIComponent(result.portalSlug)}&pin=${encodeURIComponent(result.passcode)}`,
  );
}

export async function approveListingAction(listingId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || !canManageListings(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      status: true,
      address: true,
      city: true,
      state: true,
      zip: true,
      latitude: true,
      longitude: true,
    },
  });

  if (!listing) {
    throw new Error("Listing not found.");
  }

  if (listing.status !== ListingStatus.SUBMITTED) {
    throw new Error("Only submitted listings can be approved.");
  }

  await prisma.listing.update({
    where: { id: listing.id },
    data: {
      status: ListingStatus.ACTIVE,
      listDate: new Date(),
    },
  });

  if (listing.latitude == null || listing.longitude == null) {
    try {
      const query = `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`;
      const coords = await geocodeAddress(query);
      if (coords) {
        await prisma.listing.update({
          where: { id: listing.id },
          data: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
        });
      }
    } catch {
      // Geocoding is best-effort.
    }
  }

  revalidatePath("/crm/listings");
  revalidatePath("/search");
}
