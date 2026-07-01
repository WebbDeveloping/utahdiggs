"use server";

import {
  ContactRole,
  IntakeStatus,
  ListingStatus,
  OnboardingStatus,
  SellInquiryStatus,
} from "@/generated/prisma/client";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { generateListingPasscodeHash } from "@/lib/auth/portal-auth";
import { generateUniquePortalSlug } from "@/lib/crm/slug";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { validateMlsInputStep } from "./validation";
import type { MlsDraftState } from "./types";

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}

function extractAddress(values: Record<string, unknown>) {
  const addr = values.listingAddress as
    | { street?: string; city?: string; state?: string; zip?: string }
    | undefined;
  return {
    address: addr?.street?.trim() || "Draft listing",
    city: addr?.city?.trim() || "TBD",
    state: addr?.state?.trim().toUpperCase() || "UT",
    zip: addr?.zip?.trim() || "00000",
  };
}

function extractSellerPhone(values: Record<string, unknown>): string {
  const phone = values.primaryOwnerPhone;
  if (typeof phone === "string" && phone.replace(/\D/g, "").length >= 4) {
    return phone.trim();
  }
  return "0000000000";
}

export async function saveMlsDraftAction(
  _prev: MlsDraftState,
  formData: FormData,
): Promise<MlsDraftState> {
  const session = await getConsumerSession();
  if (!session) {
    return { error: "You must be signed in to save your progress." };
  }

  const listingId = formData.get("listingId")?.toString().trim() || undefined;
  const currentStep = Number(formData.get("currentStep") ?? "1");
  const nextStep = Number(formData.get("nextStep") ?? currentStep);
  const valuesJson = formData.get("values")?.toString();

  if (!valuesJson) {
    return { error: "Missing form data." };
  }

  let values: Record<string, unknown>;
  try {
    values = JSON.parse(valuesJson) as Record<string, unknown>;
  } catch {
    return { error: "Invalid form data." };
  }

  const isAdvancingStep = nextStep > currentStep;
  if (isAdvancingStep) {
    const stepValidation = validateMlsInputStep(currentStep, values);
    if (!stepValidation.success) {
      return { fieldErrors: stepValidation.fieldErrors };
    }
  }

  const address = extractAddress(values);
  const sellerPhone = extractSellerPhone(values);
  const inquiryId = values.inquiryId as string | undefined;

  try {
    if (listingId) {
      const existing = await prisma.listing.findFirst({
        where: { id: listingId, customerId: session.id },
        include: { listingIntake: true },
      });

      if (!existing) {
        return { error: "Draft not found." };
      }

      if (!existing.listingIntake) {
        await prisma.listingIntake.create({
          data: {
            listingId,
            status: IntakeStatus.DRAFT,
            currentStep: nextStep,
            data: values as Prisma.InputJsonValue,
          },
        });
        return { listingId, saved: true };
      }

      await prisma.$transaction(async (tx) => {
        await tx.listing.update({
          where: { id: listingId },
          data: {
            address: address.address,
            city: address.city,
            state: address.state,
            zip: address.zip,
          },
        });

        await tx.listingIntake.update({
          where: { listingId },
          data: {
            currentStep: nextStep,
            data: values as Prisma.InputJsonValue,
            status: IntakeStatus.DRAFT,
          },
        });
      });

      return { listingId, saved: true };
    }

    const portalSlug = await generateUniquePortalSlug(address.address, address.city);
    const { passcodeHash } = await generateListingPasscodeHash(sellerPhone);
    const offerFormUrl = `${appBaseUrl()}/offer/${portalSlug}`;

    const created = await prisma.$transaction(async (tx) => {
      const listing = await tx.listing.create({
        data: {
          ...address,
          status: ListingStatus.SUBMITTED,
          portalSlug,
          passcodeHash,
          offerFormUrl,
          customerId: session.id,
          submittedAt: null,
          onboardingStatus: OnboardingStatus.PLAN_PENDING,
        },
      });

      await tx.listingIntake.create({
        data: {
          listingId: listing.id,
          status: IntakeStatus.DRAFT,
          currentStep: nextStep,
          data: values as Prisma.InputJsonValue,
        },
      });

      const sellerEmail =
        typeof values.primaryOwnerEmail === "string"
          ? values.primaryOwnerEmail.trim().toLowerCase()
          : session.email;

      if (sellerEmail) {
        const sellerName =
          typeof values.primaryOwnerName === "object" && values.primaryOwnerName
            ? [
                (values.primaryOwnerName as { first?: string }).first,
                (values.primaryOwnerName as { last?: string }).last,
              ]
                .filter(Boolean)
                .join(" ")
            : session.name ?? "Seller";

        const contact = await tx.contact.upsert({
          where: { email: sellerEmail },
          update: {
            name: sellerName,
            phone: sellerPhone,
          },
          create: {
            email: sellerEmail,
            name: sellerName,
            phone: sellerPhone,
          },
        });

        await tx.listingContact.create({
          data: {
            listingId: listing.id,
            contactId: contact.id,
            role: ContactRole.PRIMARY,
          },
        });
      }

      return listing;
    });

    if (inquiryId) {
      await prisma.sellInquiry.updateMany({
        where: { id: inquiryId, customerId: session.id },
        data: {
          status: SellInquiryStatus.LISTING_STARTED,
          listingId: created.id,
        },
      });
    }

    return { listingId: created.id, saved: true };
  } catch (error) {
    console.error("saveMlsDraftAction failed:", error);
    return { error: "Failed to save draft. Please try again." };
  }
}
