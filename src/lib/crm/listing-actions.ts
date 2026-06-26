"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ListingStatus, UserRole } from "@/generated/prisma/client";
import { auth } from "@/lib/auth/admin-auth";
import { canManageListings, isAdmin } from "@/lib/auth/roles";
import {
  canApproveListing,
  canAssignAgent,
  getSessionUser,
  requireCrmUser,
} from "@/lib/crm/access";
import { createListing } from "@/lib/crm/create-listing";
import { geocodeListingAddress } from "@/lib/geocode";
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
  const user = getSessionUser(session);
  if (!user || !canManageListings(user.role)) {
    return { error: "You are not authorized to create listings." };
  }

  const { input, fieldErrors } = parseFormData(formData);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  let assignedAgentId: string | null = null;
  if (user.role === UserRole.AGENT) {
    assignedAgentId = user.id;
  } else if (isAdmin(user.role)) {
    const raw = asString(formData.get("assignedAgentId"));
    assignedAgentId = raw || null;
    if (assignedAgentId) {
      const agent = await prisma.user.findFirst({
        where: { id: assignedAgentId, role: UserRole.AGENT, active: true },
      });
      if (!agent) {
        return { error: "Selected agent is not valid." };
      }
    }
  }

  let result;
  try {
    result = await createListing(input, {
      userId: user.id,
      assignedAgentId,
    });
  } catch (error) {
    console.error("createListingAction failed:", error);
    return { error: "Failed to create listing. Please try again." };
  }

  redirect(
    `/crm/listings?created=${encodeURIComponent(result.portalSlug)}&pin=${encodeURIComponent(result.passcode)}`,
  );
}

export async function approveListingAction(
  listingId: string,
  mlsNumber?: string,
): Promise<void> {
  const session = await auth();
  const user = requireCrmUser(session);

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      status: true,
      assignedAgentId: true,
      address: true,
      city: true,
      state: true,
      zip: true,
      latitude: true,
      longitude: true,
      portalSlug: true,
      offerFormUrl: true,
      listingIntake: { select: { status: true } },
      contacts: {
        where: { role: "PRIMARY" },
        select: { contact: { select: { email: true, name: true, phone: true } } },
        take: 1,
      },
    },
  });

  if (!listing) {
    throw new Error("Listing not found.");
  }

  if (!canApproveListing(user, listing)) {
    throw new Error("Unauthorized");
  }

  if (
    listing.listingIntake &&
    listing.listingIntake.status !== "SUBMITTED"
  ) {
    throw new Error("MLS intake form is still in progress.");
  }

  await prisma.listing.update({
    where: { id: listing.id },
    data: {
      status: ListingStatus.ACTIVE,
      listDate: new Date(),
      ...(mlsNumber ? { mlsNumber } : {}),
    },
  });

  if (listing.latitude == null || listing.longitude == null) {
    try {
      const coords = await geocodeListingAddress({
        address: listing.address,
        city: listing.city,
        state: listing.state,
        zip: listing.zip,
      });
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

  const seller = listing.contacts[0]?.contact;
  if (seller?.email) {
    try {
      const { sendListingWelcomeEmail } = await import(
        "@/lib/email/templates/mls-intake-submitted"
      );
      const phoneDigits = seller.phone.replace(/\D/g, "");
      await sendListingWelcomeEmail({
        sellerEmail: seller.email,
        sellerName: seller.name,
        portalSlug: listing.portalSlug,
        pinHint: phoneDigits.slice(-4) || "****",
        offerFormUrl: listing.offerFormUrl ?? undefined,
      });
    } catch (emailError) {
      console.error("Welcome email failed:", emailError);
    }
  }

  revalidatePath("/crm/listings");
  revalidatePath(`/crm/listings/${listingId}`);
  revalidatePath("/search");
}

export async function assignListingAgentAction(
  listingId: string,
  agentId: string | null,
): Promise<{ error?: string }> {
  const session = await auth();
  const user = requireCrmUser(session);

  if (!canAssignAgent(user)) {
    return { error: "You are not authorized to assign agents." };
  }

  if (agentId) {
    const agent = await prisma.user.findFirst({
      where: { id: agentId, role: UserRole.AGENT, active: true },
    });
    if (!agent) {
      return { error: "Selected agent is not valid." };
    }
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
    },
  });

  if (!listing) {
    return { error: "Listing not found." };
  }

  const previous = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { assignedAgentId: true },
  });

  await prisma.listing.update({
    where: { id: listingId },
    data: { assignedAgentId: agentId },
  });

  if (agentId && agentId !== previous?.assignedAgentId) {
    const agent = await prisma.user.findUnique({
      where: { id: agentId },
      select: { email: true, name: true, active: true },
    });
    if (agent?.active && agent.email) {
      try {
        const { sendListingAssignedEmail } = await import(
          "@/lib/email/templates/crm-notifications"
        );
        await sendListingAssignedEmail({
          agentEmail: agent.email,
          agentName: agent.name,
          address: listing.address,
          city: listing.city,
          state: listing.state,
          listingId: listing.id,
        });
      } catch (emailError) {
        console.error("Listing assignment email failed:", emailError);
      }
    }
  }

  revalidatePath("/crm/listings");
  revalidatePath(`/crm/listings/${listingId}`);

  return {};
}
