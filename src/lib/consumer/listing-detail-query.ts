import { prisma } from "@/lib/db";
import type { ConsumerListingDetail } from "@/types/consumer-listing-detail";

function mapClosingTeamMember(
  member: {
    id: string;
    name: string;
    role: "ESCROW_OFFICER" | "TRANSACTION_COORDINATOR";
    company: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
  } | null,
): ConsumerListingDetail["escrowOfficer"] {
  if (!member) return null;
  return {
    id: member.id,
    name: member.name,
    role: member.role,
    company: member.company,
    phone: member.phone,
    email: member.email,
    website: member.website,
  };
}

export async function getCustomerListingDetail(
  customerId: string,
  listingId: string,
): Promise<ConsumerListingDetail | null> {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, customerId },
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      zip: true,
      beds: true,
      baths: true,
      sqft: true,
      mlsNumber: true,
      listPrice: true,
      listDate: true,
      status: true,
      portalSlug: true,
      blairNote: true,
      blairNoteDate: true,
      priceReductionDate: true,
      priceReductionCount: true,
      marketAvgDom: true,
      submittedAt: true,
      onboardingStatus: true,
      listingIntake: { select: { status: true } },
      documents: {
        orderBy: { uploadedAt: "desc" },
        select: {
          id: true,
          name: true,
          url: true,
          uploadedAt: true,
        },
      },
      offers: {
        orderBy: { submittedDate: "desc" },
        select: {
          id: true,
          submittedDate: true,
          offerPrice: true,
          buyersAgent: true,
          status: true,
          contractPrice: true,
          settlementDate: true,
          sellerConcessions: true,
          buyerDueDiligenceDeadline: true,
          homeWarranty: true,
          financingAppraisalDeadline: true,
          sellerDisclosureDeadline: true,
        },
      },
      escrowOfficer: {
        select: {
          id: true,
          name: true,
          role: true,
          company: true,
          phone: true,
          email: true,
          website: true,
        },
      },
      transactionCoordinator: {
        select: {
          id: true,
          name: true,
          role: true,
          company: true,
          phone: true,
          email: true,
          website: true,
        },
      },
    },
  });

  if (!listing) return null;

  return {
    id: listing.id,
    address: listing.address,
    city: listing.city,
    state: listing.state,
    zip: listing.zip,
    beds: listing.beds,
    baths: listing.baths,
    sqft: listing.sqft,
    mlsNumber: listing.mlsNumber,
    listPrice: listing.listPrice?.toString() ?? null,
    listDate: listing.listDate,
    status: listing.status,
    portalSlug: listing.portalSlug,
    blairNote: listing.blairNote,
    blairNoteDate: listing.blairNoteDate,
    priceReductionDate: listing.priceReductionDate,
    priceReductionCount: listing.priceReductionCount,
    marketAvgDom: listing.marketAvgDom,
    intakeStatus: listing.listingIntake?.status ?? null,
    submittedAt: listing.submittedAt,
    onboardingStatus: listing.onboardingStatus,
    documents: listing.documents,
    offers: listing.offers.map((offer) => ({
      ...offer,
      offerPrice: offer.offerPrice?.toString() ?? null,
      contractPrice: offer.contractPrice?.toString() ?? null,
    })),
    escrowOfficer: mapClosingTeamMember(listing.escrowOfficer),
    transactionCoordinator: mapClosingTeamMember(listing.transactionCoordinator),
  };
}
