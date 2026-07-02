import type { Prisma } from "@/generated/prisma/client";
import {
  getListingWhereForUser,
  type CrmSessionUser,
} from "@/lib/crm/access";
import { prisma } from "@/lib/db";
import type { CrmContactRow } from "@/types/crm-contact";

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
