export type ContactRoleLabel = "PRIMARY" | "CO_SELLER";

export const CONTACT_ROLES = {
  PRIMARY: "PRIMARY",
  CO_SELLER: "CO_SELLER",
} as const satisfies Record<string, ContactRoleLabel>;

export function formatContactRole(role: ContactRoleLabel): string {
  return role === CONTACT_ROLES.PRIMARY ? "Primary" : "Co-seller";
}

export function isPrimaryContactRole(role: ContactRoleLabel): boolean {
  return role === CONTACT_ROLES.PRIMARY;
}
