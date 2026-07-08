import { ListingStatus } from "@/generated/prisma/client";

export function asString(value: unknown): string | undefined {
  if (value == null) return undefined;
  return String(value);
}

export function asNumber(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return undefined;
}

export function asDate(value: unknown): Date | undefined {
  const s = asString(value);
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function linkedIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "id" in item) {
        return String((item as { id: string }).id);
      }
      return "";
    })
    .filter(Boolean);
}

export function mapListingStatus(value: unknown): ListingStatus {
  const normalized = asString(value)?.toUpperCase().replace(/\s+/g, "_");
  switch (normalized) {
    case "UNDER_CONTRACT":
      return ListingStatus.UNDER_CONTRACT;
    case "PENDING":
      return ListingStatus.PENDING;
    case "CLOSED":
      return ListingStatus.CLOSED;
    case "CANCELLED":
      return ListingStatus.CANCELLED;
    default:
      return ListingStatus.ACTIVE;
  }
}
