import type { MlsInputField } from "@/lib/mls-input/schema";

const EMPTY = "—";

export function isEmptyFormattedValue(value: string): boolean {
  return !value || value === EMPTY;
}

export function formatFieldValue(field: MlsInputField, value: unknown): string {
  if (value === undefined || value === null || value === "") return EMPTY;

  if (field.type === "fullname" && typeof value === "object") {
    const v = value as { first?: string; last?: string };
    return [v.first, v.last].filter(Boolean).join(" ") || EMPTY;
  }

  if (field.type === "address" && typeof value === "object") {
    const v = value as { street?: string; city?: string; state?: string; zip?: string };
    return [v.street, v.city, v.state, v.zip].filter(Boolean).join(", ") || EMPTY;
  }

  if (field.type === "checkbox" && Array.isArray(value)) {
    return value.join(", ") || EMPTY;
  }

  if (field.type === "matrix" && typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  if (field.type === "file" && Array.isArray(value)) {
    return value.map((f: { name?: string; url?: string }) => f.name || f.url).join(", ");
  }

  if (field.type === "signature" && typeof value === "string") {
    return value ? "Signed (see document)" : EMPTY;
  }

  return String(value);
}

export function formatCheckboxValue(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (Array.isArray(value)) {
    const joined = value.filter(Boolean).join(", ");
    return joined || null;
  }
  return String(value);
}

export function formatScalarValue(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  return String(value);
}

type SchoolsRecord = Record<string, { name?: string } | undefined>;

export function formatSchoolName(data: Record<string, unknown>, key: string): string | null {
  const schools = data.schools as SchoolsRecord | undefined;
  const name = schools?.[key]?.name?.trim();
  return name || null;
}
