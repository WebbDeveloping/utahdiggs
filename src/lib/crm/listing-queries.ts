import { ListingStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  getListingWhereForUser,
  resolveCanAccessListing,
  type CrmSessionUser,
} from "@/lib/crm/access";
import { getPrimaryListingPhotoUrl } from "@/lib/storage/document-classify";

const pendingApprovalWhere = {
  status: ListingStatus.SUBMITTED,
  submittedAt: { not: null },
} as const;

export async function getPendingApprovalListingCount(user: CrmSessionUser) {
  return prisma.listing.count({
    where: {
      ...getListingWhereForUser(user),
      ...pendingApprovalWhere,
    },
  });
}

const crmListingSelect = {
  id: true,
  address: true,
  city: true,
  state: true,
  listPrice: true,
  status: true,
  listingSlug: true,
  mlsNumber: true,
  listDate: true,
  submittedAt: true,
  customerId: true,
  assignedAgentId: true,
  onboardingStatus: true,
  servicePlan: true,
  scheduledCallAt: true,
  agreementSignedAt: true,
  listingIntake: { select: { status: true } },
  assignedAgent: { select: { id: true, name: true, email: true } },
  _count: {
    select: {
      offers: true,
      sellerRequests: true,
    },
  },
  documents: {
    select: { url: true, name: true },
    orderBy: { uploadedAt: "asc" },
  },
} as const;

export async function getCrmListings(user: CrmSessionUser) {
  const listings = await prisma.listing.findMany({
    where: getListingWhereForUser(user),
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    select: crmListingSelect,
  });

  return listings.map(({ documents, ...listing }) => ({
    ...listing,
    primaryPhotoUrl: getPrimaryListingPhotoUrl(documents),
  }));
}

export async function getCrmListingById(user: CrmSessionUser, id: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      listingIntake: true,
      contacts: { include: { contact: true } },
      documents: { orderBy: { uploadedAt: "asc" } },
      customer: { select: { name: true, email: true, phone: true } },
      assignedAgent: { select: { id: true, name: true, email: true } },
    },
  });

  if (!listing) {
    return null;
  }

  if (!(await resolveCanAccessListing(user, listing))) {
    return null;
  }

  return listing;
}

export async function getActiveAgents() {
  return prisma.user.findMany({
    where: { role: "AGENT", active: true },
    orderBy: [{ name: "asc" }, { email: "asc" }],
    select: { id: true, name: true, email: true },
  });
}
