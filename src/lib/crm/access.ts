import type { Session } from "next-auth";
import { ListingStatus, UserRole } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";
import {
  canManageListings,
  isAdmin,
} from "@/lib/auth/roles";

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

export function canAccessListing(
  user: CrmSessionUser,
  listing: { assignedAgentId: string | null },
): boolean {
  if (isAdmin(user.role)) {
    return true;
  }
  return listing.assignedAgentId === user.id;
}

export function canApproveListing(
  user: CrmSessionUser,
  listing: { assignedAgentId: string | null; status: ListingStatus },
): boolean {
  if (!canManageListings(user.role)) {
    return false;
  }
  if (listing.status !== ListingStatus.SUBMITTED) {
    return false;
  }
  return canAccessListing(user, listing);
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
