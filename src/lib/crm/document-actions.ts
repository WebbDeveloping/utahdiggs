"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/admin-auth";
import { canManageListings } from "@/lib/auth/roles";
import {
  canAccessListing,
  getSessionUser,
} from "@/lib/crm/access";
import { isListingPhoto } from "@/lib/storage/document-classify";
import { prisma } from "@/lib/db";
import {
  isPublicBlobUrl,
  isVercelBlobUrl,
  MAX_PHOTO_COUNT,
} from "@/lib/storage/blob";

export type CrmDocumentActionState = {
  error?: string;
  success?: boolean;
};

export async function assertCrmListingAccess(listingId: string) {
  const session = await auth();
  const user = getSessionUser(session);
  if (!user || !canManageListings(user.role)) {
    throw new Error("Unauthorized.");
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, assignedAgentId: true },
  });

  if (!listing || !canAccessListing(user, listing)) {
    throw new Error("Listing not found.");
  }

  return { user, listing };
}

export async function createCrmListingPhotoAction(
  _prev: CrmDocumentActionState,
  formData: FormData,
): Promise<CrmDocumentActionState> {
  const listingId = String(formData.get("listingId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (!listingId || !name || !url) {
    return { error: "Photo name and file are required." };
  }

  if (!isPublicBlobUrl(url)) {
    return { error: "Invalid photo URL." };
  }

  try {
    const { user } = await assertCrmListingAccess(listingId);

    const existingDocuments = await prisma.document.findMany({
      where: { listingId },
      select: { name: true, url: true },
    });
    const photoCount = existingDocuments.filter(isListingPhoto).length;

    if (photoCount >= MAX_PHOTO_COUNT) {
      return { error: `A listing can have at most ${MAX_PHOTO_COUNT} photos.` };
    }

    await prisma.document.create({
      data: {
        listingId,
        name,
        url,
        uploadedByUserId: user.id,
      },
    });

    revalidatePath(`/crm/listings/${listingId}`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return { error: message };
  }
}

export async function createCrmListingDocumentAction(
  _prev: CrmDocumentActionState,
  formData: FormData,
): Promise<CrmDocumentActionState> {
  const listingId = String(formData.get("listingId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (!listingId || !name || !url) {
    return { error: "Document name and file are required." };
  }

  if (!isVercelBlobUrl(url)) {
    return { error: "Invalid document URL." };
  }

  try {
    const { user } = await assertCrmListingAccess(listingId);

    await prisma.document.create({
      data: {
        listingId,
        name,
        url,
        uploadedByUserId: user.id,
      },
    });

    revalidatePath(`/crm/listings/${listingId}`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return { error: message };
  }
}

export async function deleteCrmListingDocumentAction(
  _prev: CrmDocumentActionState,
  formData: FormData,
): Promise<CrmDocumentActionState> {
  const listingId = String(formData.get("listingId") ?? "").trim();
  const documentId = String(formData.get("documentId") ?? "").trim();

  if (!listingId || !documentId) {
    return { error: "Document is required." };
  }

  try {
    await assertCrmListingAccess(listingId);

    const document = await prisma.document.findFirst({
      where: { id: documentId, listingId },
      select: { id: true, name: true, url: true },
    });

    if (!document) {
      return { error: "Document not found." };
    }

    await prisma.document.delete({
      where: { id: documentId },
    });

    revalidatePath(`/crm/listings/${listingId}`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed.";
    return { error: message };
  }
}

export async function createCrmListingPhotoFromUpload(
  listingId: string,
  name: string,
  url: string,
): Promise<CrmDocumentActionState> {
  const formData = new FormData();
  formData.set("listingId", listingId);
  formData.set("name", name);
  formData.set("url", url);
  return createCrmListingPhotoAction({}, formData);
}

export async function createCrmListingDocumentFromUpload(
  listingId: string,
  name: string,
  url: string,
): Promise<CrmDocumentActionState> {
  const formData = new FormData();
  formData.set("listingId", listingId);
  formData.set("name", name);
  formData.set("url", url);
  return createCrmListingDocumentAction({}, formData);
}

export async function deleteCrmListingDocument(
  listingId: string,
  documentId: string,
): Promise<CrmDocumentActionState> {
  const formData = new FormData();
  formData.set("listingId", listingId);
  formData.set("documentId", documentId);
  return deleteCrmListingDocumentAction({}, formData);
}
