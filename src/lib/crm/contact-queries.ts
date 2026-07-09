import type { Prisma } from "@/generated/prisma/client";
import {
  getListingWhereForUser,
  type CrmSessionUser,
} from "@/lib/crm/access";
import { prisma } from "@/lib/db";
import type {
  CrmContactDetail,
  CrmContactRow,
} from "@/types/crm-contact";

function getAccessibleListingWhereForUser(user: CrmSessionUser) {
  return getListingWhereForUser(user);
}

export function getContactWhereForUser(
  user: CrmSessionUser,
): Prisma.ContactWhereInput {
  return {
    listings: {
      some: {
        listing: getAccessibleListingWhereForUser(user),
      },
    },
  };
}

function buildSearchWhere(q: string): Prisma.ContactWhereInput {
  const term = q.trim();
  if (!term) {
    return {};
  }

  return {
    OR: [
      { name: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
    ],
  };
}

const accessibleListingSelect = {
  role: true,
  listing: {
    select: {
      id: true,
      address: true,
      city: true,
      status: true,
      listingSlug: true,
      assignedAgentId: true,
    },
  },
} as const;

export async function getCrmContacts(
  user: CrmSessionUser,
  options: { q?: string } = {},
): Promise<CrmContactRow[]> {
  const listingWhere = getAccessibleListingWhereForUser(user);
  const contacts = await prisma.contact.findMany({
    where: {
      ...getContactWhereForUser(user),
      ...buildSearchWhere(options.q ?? ""),
    },
    orderBy: [{ name: "asc" }, { email: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      listings: {
        where: {
          listing: listingWhere,
        },
        select: accessibleListingSelect,
      },
      _count: {
        select: {
          listings: true,
        },
      },
    },
  });

  return contacts.map((contact) => ({
    id: contact.id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    createdAt: contact.createdAt,
    listings: contact.listings,
    totalListingCount: contact._count.listings,
  }));
}

export async function getCrmContactById(
  user: CrmSessionUser,
  id: string,
): Promise<CrmContactDetail | null> {
  const listingWhere = getAccessibleListingWhereForUser(user);

  const contact = await prisma.contact.findFirst({
    where: {
      id,
      ...getContactWhereForUser(user),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      listings: {
        where: { listing: listingWhere },
        orderBy: { listing: { address: "asc" } },
        select: {
          role: true,
          listing: {
            select: {
              id: true,
              address: true,
              city: true,
              state: true,
              zip: true,
              status: true,
              listPrice: true,
              mlsNumber: true,
              listingSlug: true,
              onboardingStatus: true,
              servicePlan: true,
              agreementSignedAt: true,
              scheduledCallAt: true,
              assignedAgent: {
                select: { id: true, name: true, email: true },
              },
              _count: {
                select: {
                  showings: true,
                  offers: true,
                  sellerRequests: {
                    where: { status: { in: ["NEW", "IN_PROGRESS"] } },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!contact) {
    return null;
  }

  const listingIds = contact.listings.map((link) => link.listing.id);

  const [customer, requests, agreements] = await Promise.all([
    prisma.customer.findUnique({
      where: { email: contact.email },
      select: { id: true, name: true, phone: true },
    }),
    prisma.sellerRequest.findMany({
      where: {
        OR: [
          { sellerEmail: { equals: contact.email, mode: "insensitive" } },
          ...(listingIds.length > 0 ? [{ listingId: { in: listingIds } }] : []),
        ],
      },
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        status: true,
        requestSummary: true,
        propertyAddress: true,
        submittedAt: true,
        message: true,
        listingId: true,
      },
    }),
    prisma.agreementSignature.findMany({
      where: {
        OR: [
          { signerEmail: { equals: contact.email, mode: "insensitive" } },
          ...(listingIds.length > 0 ? [{ listingId: { in: listingIds } }] : []),
        ],
      },
      orderBy: { signedAt: "desc" },
      select: {
        id: true,
        listingId: true,
        signerName: true,
        signerEmail: true,
        signedAt: true,
        agreementVersion: true,
        signedDocumentUrl: true,
        listing: { select: { address: true, city: true } },
      },
    }),
  ]);

  const listings = contact.listings.map((link) => ({
    role: link.role,
    listing: {
      id: link.listing.id,
      address: link.listing.address,
      city: link.listing.city,
      state: link.listing.state,
      zip: link.listing.zip,
      status: link.listing.status,
      listPrice: link.listing.listPrice?.toString() ?? null,
      mlsNumber: link.listing.mlsNumber,
      listingSlug: link.listing.listingSlug,
      onboardingStatus: link.listing.onboardingStatus,
      servicePlan: link.listing.servicePlan,
      agreementSignedAt: link.listing.agreementSignedAt,
      scheduledCallAt: link.listing.scheduledCallAt,
      assignedAgent: link.listing.assignedAgent,
      showingCount: link.listing._count.showings,
      offerCount: link.listing._count.offers,
      openRequestCount: link.listing._count.sellerRequests,
    },
  }));

  return {
    id: contact.id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
    customer,
    listings,
    requests,
    agreements: agreements.map((agreement) => ({
      id: agreement.id,
      listingId: agreement.listingId,
      listingAddress: `${agreement.listing.address}, ${agreement.listing.city}`,
      signerName: agreement.signerName,
      signerEmail: agreement.signerEmail,
      signedAt: agreement.signedAt,
      agreementVersion: agreement.agreementVersion,
      signedDocumentUrl: agreement.signedDocumentUrl,
    })),
    activityTotals: {
      showings: listings.reduce((sum, link) => sum + link.listing.showingCount, 0),
      offers: listings.reduce((sum, link) => sum + link.listing.offerCount, 0),
      openRequests: listings.reduce(
        (sum, link) => sum + link.listing.openRequestCount,
        0,
      ),
    },
  };
}
