"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  OnboardingStatus,
  ServicePlan,
  SignatureMethod,
} from "@/generated/prisma/client";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { buildOnboardingPath } from "@/lib/consumer/onboarding";
import { buildListingDocumentsPath } from "@/lib/consumer/listing-documents-path";
import { LISTING_AGREEMENT_SIGNED_NAME } from "@/lib/documents/listing-document-kinds";
import { prisma } from "@/lib/db";
import {
  buildUarAgreementPrefill,
  resolveUarAgreementValues,
} from "@/content/uar-listing-agreement";
import {
  sendAgreementSignedEmail,
  sendOnboardingCallScheduledEmail,
  sendOnboardingPhotosSubmittedEmail,
} from "@/lib/email/templates/onboarding-notifications";
import {
  getRequestAuditContext,
  hashUarAgreementSubmission,
  LISTING_AGREEMENT_VERSION,
} from "@/lib/signature/agreement-audit";
import { generateFinalUarForm8Pdf } from "@/lib/signature/fill-uar-form-8-template";
import { parseUarAgreementFormData } from "@/lib/signature/uar-agreement-schema";
import {
  fetchSignatureImageBytes,
  uploadSignedAgreementPdf,
} from "@/lib/signature/signed-document-storage";
import type { OnboardingActionState } from "@/types/onboarding";

async function getOwnedListing(listingId: string, customerId: string) {
  return prisma.listing.findFirst({
    where: { id: listingId, customerId },
    include: {
      contacts: { include: { contact: true } },
    },
  });
}

function revalidateOnboarding(listingId: string) {
  revalidatePath(buildOnboardingPath(listingId));
  revalidatePath(`${buildOnboardingPath(listingId)}/plan`);
  revalidatePath(`${buildOnboardingPath(listingId)}/agreement`);
  revalidatePath(`${buildOnboardingPath(listingId)}/photos`);
  revalidatePath(`${buildOnboardingPath(listingId)}/call`);
  revalidatePath(buildListingDocumentsPath(listingId));
  revalidatePath("/account/listings");
}

export async function selectServicePlanAction(
  _prev: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const session = await getConsumerSession();
  if (!session) return { error: "You must be signed in." };

  const listingId = formData.get("listingId")?.toString().trim();
  const plan = formData.get("servicePlan")?.toString().trim();

  if (!listingId) return { error: "Missing listing." };
  if (plan !== "VIRTUAL" && plan !== "FULL_SERVICE") {
    return { fieldErrors: { servicePlan: "Please select a plan." } };
  }

  const listing = await getOwnedListing(listingId, session.id);
  if (!listing) return { error: "Listing not found." };

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      servicePlan: plan as ServicePlan,
      onboardingStatus: OnboardingStatus.AGREEMENT_PENDING,
    },
  });

  revalidateOnboarding(listingId);

  if (listing.servicePlan) {
    return {};
  }

  redirect(`${buildOnboardingPath(listingId)}/agreement`);
}

export async function signListingAgreementAction(
  _prev: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const session = await getConsumerSession();
  if (!session) return { error: "You must be signed in." };

  const listingId = formData.get("listingId")?.toString().trim();
  const esignConsent = formData.get("esignConsent")?.toString();

  if (!listingId) return { error: "Missing listing." };
  if (esignConsent !== "on") {
    return {
      fieldErrors: {
        esignConsent: "You must consent to sign electronically to continue.",
      },
    };
  }

  const parsed = parseUarAgreementFormData(formData);
  if (parsed.fieldErrors) {
    return { fieldErrors: parsed.fieldErrors };
  }
  if (!parsed.values) {
    return { error: "Invalid agreement form submission." };
  }

  const listing = await getOwnedListing(listingId, session.id);
  if (!listing) return { error: "Listing not found." };
  if (!listing.servicePlan) {
    return { error: "Please select a plan first." };
  }
  if (listing.agreementSignedAt) {
    return { error: "This agreement has already been signed." };
  }

  const formValues = {
    ...parsed.values,
    seller1Phone:
      listing.contacts
        .find((contact) => contact.role === "PRIMARY")
        ?.contact.phone?.trim() ?? "",
  };
  const signerName =
    `${formValues.seller1FirstName} ${formValues.seller1LastName}`.trim();
  if (signerName.length < 2) {
    return {
      fieldErrors: {
        seller1FirstName: "Please provide the seller's full name.",
      },
    };
  }

  const signatureMethod =
    formValues.signatureMethod === "type"
      ? SignatureMethod.TYPE
      : SignatureMethod.DRAW;
  const signedAt = new Date();
  const formSubmissionHash = hashUarAgreementSubmission(
    listing.servicePlan,
    formValues,
  );
  const { ipAddress, userAgent } = await getRequestAuditContext();
  const prefill = buildUarAgreementPrefill({
    address: formValues.propertyAddress,
    city: formValues.propertyCity,
    state: formValues.propertyState,
    zip: formValues.propertyZip,
    sellerEmail: formValues.sellerEmail,
    servicePlan: listing.servicePlan,
  });
  const resolvedValues = resolveUarAgreementValues(
    formValues,
    prefill,
    listing.servicePlan,
  );

  let signedDocumentUrl: string;
  let agreementHash: string;
  try {
    const seller1SignaturePngBytes = await fetchSignatureImageBytes(
      formValues.seller1SignatureUrl,
    );
    const seller1InitialsPngBytes = await fetchSignatureImageBytes(
      formValues.seller1InitialsUrl,
    );
    const seller2SignaturePngBytes =
      formValues.multipleOwners === "YES" && formValues.seller2SignatureUrl
        ? await fetchSignatureImageBytes(formValues.seller2SignatureUrl)
        : undefined;
    const seller2InitialsPngBytes =
      formValues.multipleOwners === "YES" && formValues.seller2InitialsUrl
        ? await fetchSignatureImageBytes(formValues.seller2InitialsUrl)
        : undefined;

    const pdfInput = {
      values: resolvedValues,
      audit: {
        signerName,
        signerEmail: formValues.sellerEmail,
        signatureMethod,
        signedAt,
        agreementVersion: LISTING_AGREEMENT_VERSION,
        agreementHash: formSubmissionHash,
        ipAddress,
        userAgent,
      },
      seller1SignaturePngBytes,
      seller1InitialsPngBytes,
      seller2SignaturePngBytes,
      seller2InitialsPngBytes,
    };

    const result = await generateFinalUarForm8Pdf(pdfInput);
    const pdfBytes = result.pdfBytes;
    agreementHash = result.documentHash;

    signedDocumentUrl = await uploadSignedAgreementPdf(listingId, pdfBytes);
  } catch (error) {
    console.error("Signed agreement PDF generation failed:", error);
    return { error: "Could not generate signed agreement. Please try again." };
  }

  const sellerName =
    listing.contacts.find((c) => c.role === "PRIMARY")?.contact.name ??
    session.name ??
    signerName;

  await prisma.$transaction(async (tx) => {
    await tx.listing.update({
      where: { id: listingId },
      data: {
        agreementSignedAt: signedAt,
        agreementSignatureUrl: formValues.seller1SignatureUrl,
        onboardingStatus: OnboardingStatus.PHOTOS_PENDING,
      },
    });

    await tx.agreementSignature.create({
      data: {
        listingId,
        customerId: session.id,
        signerName,
        signerEmail: formValues.sellerEmail,
        signatureMethod,
        signatureImageUrl: formValues.seller1SignatureUrl,
        signedDocumentUrl,
        agreementVersion: LISTING_AGREEMENT_VERSION,
        agreementHash,
        formData: formValues,
        esignConsentAt: signedAt,
        signedAt,
        ipAddress,
        userAgent,
      },
    });

    await tx.document.create({
      data: {
        listingId,
        name: LISTING_AGREEMENT_SIGNED_NAME,
        url: signedDocumentUrl,
      },
    });
  });

  try {
    await sendAgreementSignedEmail({
      listingId,
      address: listing.address,
      city: listing.city,
      state: listing.state,
      sellerName,
      servicePlan: listing.servicePlan,
    });
  } catch (emailError) {
    console.error("Agreement signed email failed:", emailError);
  }

  revalidateOnboarding(listingId);
  redirect(`${buildOnboardingPath(listingId)}/photos`);
}

export async function submitOnboardingPhotosAction(
  _prev: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const session = await getConsumerSession();
  if (!session) return { error: "You must be signed in." };

  const listingId = formData.get("listingId")?.toString().trim();
  const proPhotoTourRequested =
    formData.get("proPhotoTourRequested") === "true";

  if (!listingId) return { error: "Missing listing." };

  const listing = await getOwnedListing(listingId, session.id);
  if (!listing) return { error: "Listing not found." };
  if (!listing.agreementSignedAt) {
    return { error: "Please sign the listing agreement first." };
  }

  const photos: { name: string; url: string }[] = [];
  for (let i = 0; i < 20; i++) {
    const url = formData.get(`photoUrl${i}`)?.toString().trim();
    const name = formData.get(`photoName${i}`)?.toString().trim();
    if (url) {
      photos.push({ name: name || `Photo ${i + 1}`, url });
    }
  }

  const isFullService = listing.servicePlan === "FULL_SERVICE";
  if (!isFullService && photos.length < 1) {
    return { fieldErrors: { photos: "Add at least one photo to continue." } };
  }
  if (isFullService && photos.length < 1 && !proPhotoTourRequested) {
    return {
      fieldErrors: {
        photos:
          "Upload photos or check the box to schedule a professional photo tour.",
      },
    };
  }

  const sellerName =
    listing.contacts.find((c) => c.role === "PRIMARY")?.contact.name ??
    session.name ??
    "Seller";

  await prisma.$transaction(async (tx) => {
    if (photos.length > 0) {
      await tx.document.createMany({
        data: photos.map((photo) => ({
          listingId,
          name: photo.name,
          url: photo.url,
        })),
      });
    }

    await tx.listing.update({
      where: { id: listingId },
      data: {
        proPhotoTourRequested,
        onboardingStatus: OnboardingStatus.CALL_PENDING,
      },
    });
  });

  if (photos.length > 0 || proPhotoTourRequested) {
    try {
      await sendOnboardingPhotosSubmittedEmail({
        listingId,
        address: listing.address,
        city: listing.city,
        sellerName,
        photoCount: photos.length,
        proPhotoTourRequested,
      });
    } catch (emailError) {
      console.error("Photos submitted email failed:", emailError);
    }
  }

  revalidateOnboarding(listingId);
  redirect(`${buildOnboardingPath(listingId)}/call`);
}

export async function scheduleOnboardingCallAction(
  _prev: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const session = await getConsumerSession();
  if (!session) return { error: "You must be signed in." };

  const listingId = formData.get("listingId")?.toString().trim();
  const callDate = formData.get("callDate")?.toString().trim();
  const callTime = formData.get("callTime")?.toString().trim();
  const callNotes = formData.get("callNotes")?.toString().trim() ?? "";

  if (!listingId) return { error: "Missing listing." };
  if (!callDate) {
    return { fieldErrors: { callDate: "Please select a date." } };
  }
  if (!callTime) {
    return { fieldErrors: { callTime: "Please select a time." } };
  }

  const scheduledCallAt = new Date(`${callDate}T${callTime}`);
  if (Number.isNaN(scheduledCallAt.getTime())) {
    return { fieldErrors: { callDate: "Invalid date or time." } };
  }
  if (scheduledCallAt.getTime() < Date.now()) {
    return {
      fieldErrors: { callDate: "Please choose a future date and time." },
    };
  }

  const listing = await getOwnedListing(listingId, session.id);
  if (!listing) return { error: "Listing not found." };

  const sellerName =
    listing.contacts.find((c) => c.role === "PRIMARY")?.contact.name ??
    session.name ??
    "Seller";

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      scheduledCallAt,
      callNotes: callNotes || null,
      onboardingStatus: OnboardingStatus.MLS_INTAKE_PENDING,
    },
  });

  try {
    await sendOnboardingCallScheduledEmail({
      listingId,
      address: listing.address,
      city: listing.city,
      state: listing.state,
      sellerName,
      servicePlan: listing.servicePlan,
      scheduledCallAt,
      callNotes,
    });
  } catch (emailError) {
    console.error("Call scheduled email failed:", emailError);
  }

  revalidateOnboarding(listingId);
  redirect(buildOnboardingPath(listingId));
}
