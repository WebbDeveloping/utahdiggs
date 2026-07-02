import { findSignedListingAgreementDocument } from "@/lib/documents/listing-document-kinds";
import { prisma } from "@/lib/db";
import type { OnboardingListingDetail } from "@/types/onboarding";

export async function getOnboardingListing(
  customerId: string,
  listingId: string,
): Promise<OnboardingListingDetail | null> {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, customerId },
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      zip: true,
      servicePlan: true,
      onboardingStatus: true,
      agreementSignedAt: true,
      agreementSignatureUrl: true,
      proPhotoTourRequested: true,
      scheduledCallAt: true,
      callNotes: true,
      submittedAt: true,
      status: true,
      listingSlug: true,
      contacts: {
        where: { role: "PRIMARY" },
        take: 1,
        select: { contact: { select: { phone: true } } },
      },
      documents: {
        orderBy: { uploadedAt: "asc" },
        select: { id: true, name: true, url: true, uploadedAt: true },
      },
      listingIntake: {
        select: { status: true, currentStep: true },
      },
    },
  });

  if (!listing) return null;

  const signedAgreementDocument = findSignedListingAgreementDocument(listing.documents);
  const { contacts, ...listingData } = listing;

  return {
    ...listingData,
    sellerPhone: contacts[0]?.contact.phone ?? "",
    signedAgreementDocumentId: signedAgreementDocument?.id ?? null,
  };
}
