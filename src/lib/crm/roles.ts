export type CrmUserRole = "ADMIN" | "AGENT";

export const CRM_USER_ROLES = {
  ADMIN: "ADMIN",
  AGENT: "AGENT",
} as const satisfies Record<string, CrmUserRole>;

export function formatUserRole(role: CrmUserRole): string {
  return role === "ADMIN" ? "Admin" : "Agent";
}
