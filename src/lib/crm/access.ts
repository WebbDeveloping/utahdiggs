import type { Session } from "next-auth";
import { ListingStatus, UserRole } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";
import {
  canManageListings,
  isAdmin,
} from "@/lib/auth/roles";
import { getDefaultMlsVaUserId } from "@/lib/crm/mls-ops-settings";

export type CrmSessionUser = {
  id: string;
  role: UserRole;
};

export function getSessionUser(session: Session | null): CrmSessionUser | null {
  if (!session?.user?.id || !session.user.role) {
    return null;
  }
  return { id: session.user.id, role: session.user.role };
}

export function getListingWhereForUser(
  user: CrmSessionUser,
): Prisma.ListingWhereInput {
  if (isAdmin(user.role)) {
    return {};
  }
  return { assignedAgentId: user.id };
}

export function canEditMlsOpsSettings(user: CrmSessionUser): boolean {
  return isAdmin(user.role);
}

export function canEditMarketData(user: CrmSessionUser): boolean {
  return isAdmin(user.role);
}

export function isDefaultMlsVa(
  userId: string,
  defaultVaUserId: string | null,
): boolean {
  return Boolean(defaultVaUserId && userId === defaultVaUserId);
}

/** Admin, assigned agent, or configured MLS VA for SUBMITTED listings. */
export function canAccessListing(
  user: CrmSessionUser,
  listing: {
    assignedAgentId: string | null;
    status?: ListingStatus;
  },
  defaultVaUserId: string | null = null,
): boolean {
  if (isAdmin(user.role)) {
    return true;
  }
  if (listing.assignedAgentId === user.id) {
    return true;
  }
  if (
    isDefaultMlsVa(user.id, defaultVaUserId) &&
    listing.status === ListingStatus.SUBMITTED
  ) {
    return true;
  }
  return false;
}

export async function resolveCanAccessListing(
  user: CrmSessionUser,
  listing: {
    assignedAgentId: string | null;
    status?: ListingStatus;
  },
): Promise<boolean> {
  const defaultVaUserId = await getDefaultMlsVaUserId();
  return canAccessListing(user, listing, defaultVaUserId);
}

export function canApproveListing(
  user: CrmSessionUser,
  listing: { assignedAgentId: string | null; status: ListingStatus },
  defaultVaUserId: string | null = null,
): boolean {
  if (!canManageListings(user.role)) {
    return false;
  }
  if (listing.status !== ListingStatus.SUBMITTED) {
    return false;
  }
  return canAccessListing(user, listing, defaultVaUserId);
}

export async function resolveCanApproveListing(
  user: CrmSessionUser,
  listing: { assignedAgentId: string | null; status: ListingStatus },
): Promise<boolean> {
  const defaultVaUserId = await getDefaultMlsVaUserId();
  return canApproveListing(user, listing, defaultVaUserId);
}

export function canAccessMlsQueueListing(
  user: CrmSessionUser,
  listing: { assignedAgentId: string | null },
  defaultVaUserId: string | null,
): boolean {
  if (isAdmin(user.role)) {
    return true;
  }
  if (isDefaultMlsVa(user.id, defaultVaUserId)) {
    return true;
  }
  return listing.assignedAgentId === user.id;
}

export function getMlsQueueWhereForUser(
  user: CrmSessionUser,
  defaultVaUserId: string | null,
): Prisma.ListingWhereInput {
  if (isAdmin(user.role) || isDefaultMlsVa(user.id, defaultVaUserId)) {
    return {};
  }
  return { assignedAgentId: user.id };
}

export function canAssignAgent(user: CrmSessionUser): boolean {
  return isAdmin(user.role);
}

export function requireCrmUser(session: Session | null): CrmSessionUser {
  const user = getSessionUser(session);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
