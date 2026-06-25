export type CrmUserRole = "ADMIN" | "AGENT";

export function formatUserRole(role: CrmUserRole): string {
  return role === "ADMIN" ? "Admin" : "Agent";
}
