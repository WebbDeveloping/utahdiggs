import { prisma } from "@/lib/db";
import { getPrimaryListingPhotoUrl } from "@/lib/storage/document-classify";
import type { CustomerListingSummary } from "@/types/consumer-listing";

export async function getCustomerListings(
  customerId: string,
): Promise<CustomerListingSummary[]> {
  const listings = await prisma.listing.findMany({
    where: { customerId },
    orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      listPrice: true,
      status: true,
      portalSlug: true,
      submittedAt: true,
      createdAt: true,
      onboardingStatus: true,
      servicePlan: true,
      agreementSignedAt: true,
      scheduledCallAt: true,
      documents: {
        orderBy: { uploadedAt: "asc" },
        select: { name: true, url: true },
      },
      listingIntake: {
        select: {
          status: true,
          currentStep: true,
          updatedAt: true,
        },
      },
    },
  });

  return listings.map((listing) => ({
    id: listing.id,
    address: listing.address,
    city: listing.city,
    state: listing.state,
    listPrice: listing.listPrice?.toString() ?? null,
    status: listing.status,
    portalSlug: listing.portalSlug,
    primaryPhotoUrl: getPrimaryListingPhotoUrl(listing.documents),
    submittedAt: listing.submittedAt,
    createdAt: listing.createdAt,
    intakeStatus: listing.listingIntake?.status ?? null,
    intakeCurrentStep: listing.listingIntake?.currentStep ?? null,
    intakeUpdatedAt: listing.listingIntake?.updatedAt ?? null,
    onboardingStatus: listing.onboardingStatus,
    servicePlan: listing.servicePlan,
    agreementSignedAt: listing.agreementSignedAt,
    scheduledCallAt: listing.scheduledCallAt,
  }));
}
