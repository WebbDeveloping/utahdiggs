"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/admin-auth";
import { isAdmin } from "@/lib/auth/roles";
import { getSessionUser } from "@/lib/crm/access";
import type { ContactRoleLabel } from "@/lib/crm/contact-roles";
import type { ListingStatusValue } from "@/lib/crm/listing-status";
import { prisma } from "@/lib/db";

export type ContactDeleteActionState = {
  error?: string;
  success?: boolean;
};

export type ContactDeletePreviewListing = {
  id: string;
  address: string;
  city: string;
  status: ListingStatusValue;
  role: ContactRoleLabel;
};

export type ContactDeletePreview = {
  id: string;
  name: string;
  email: string;
  listings: ContactDeletePreviewListing[];
  customer: { id: string; name: string | null } | null;
};

async function requireAdminSession() {
  const session = await auth();
  const user = getSessionUser(session);
  if (!user || !isAdmin(user.role)) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function getContactDeletePreviewAction(
  contactId: string,
): Promise<{ preview?: ContactDeletePreview; error?: string }> {
  try {
    await requireAdminSession();

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      select: {
        id: true,
        name: true,
        email: true,
        listings: {
          select: {
            role: true,
            listing: {
              select: {
                id: true,
                address: true,
                city: true,
                status: true,
              },
            },
          },
          orderBy: { listing: { address: "asc" } },
        },
      },
    });

    if (!contact) {
      return { error: "Contact not found." };
    }

    const customer = await prisma.customer.findUnique({
      where: { email: contact.email },
      select: { id: true, name: true },
    });

    return {
      preview: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        listings: contact.listings.map((link) => ({
          id: link.listing.id,
          address: link.listing.address,
          city: link.listing.city,
          status: link.listing.status,
          role: link.role,
        })),
        customer,
      },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to load delete preview.",
    };
  }
}

export async function deleteContactAction(
  contactId: string,
  confirmEmail: string,
): Promise<ContactDeleteActionState> {
  try {
    await requireAdminSession();

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      select: {
        id: true,
        email: true,
        listings: {
          select: { listingId: true },
        },
      },
    });

    if (!contact) {
      return { error: "Contact not found." };
    }

    if (confirmEmail.trim().toLowerCase() !== contact.email.toLowerCase()) {
      return { error: "Confirmation email does not match this contact." };
    }

    const listingIds = contact.listings.map((link) => link.listingId);

    await prisma.$transaction(async (tx) => {
      if (listingIds.length > 0) {
        await tx.listing.deleteMany({
          where: { id: { in: listingIds } },
        });
      }

      await tx.customer.deleteMany({
        where: { email: contact.email },
      });

      await tx.contact.delete({
        where: { id: contact.id },
      });
    });

    revalidatePath("/crm/contacts");
    revalidatePath("/crm/listings");
    revalidatePath("/crm");
    for (const listingId of listingIds) {
      revalidatePath(`/crm/listings/${listingId}`);
    }

    return { success: true };
  } catch (error) {
    console.error("deleteContactAction failed:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to delete contact.",
    };
  }
}
