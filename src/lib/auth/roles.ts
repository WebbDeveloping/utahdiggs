import { UserRole } from "@/generated/prisma/client";

export { UserRole };

export const CRM_ROLES = [UserRole.ADMIN, UserRole.AGENT] as const;

export function isAdmin(role: UserRole | undefined): boolean {
  return role === UserRole.ADMIN;
}

export function canManageUsers(role: UserRole | undefined): boolean {
  return role === UserRole.ADMIN;
}

export function canManageListings(role: UserRole | undefined): boolean {
  return role === UserRole.ADMIN || role === UserRole.AGENT;
}

export function requireRole(
  role: UserRole | undefined,
  allowed: UserRole[],
): void {
  if (!role || !allowed.includes(role)) {
    throw new Error("Unauthorized");
  }
}
