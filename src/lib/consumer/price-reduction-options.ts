export type ReductionOption = "A" | "B" | "C";

const FIVE_THOUSAND = 5_000;

/** Round up to the nearest $5,000. Exact multiples stay unchanged. */
export function ceilToNearest5k(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.ceil(amount / FIVE_THOUSAND) * FIVE_THOUSAND;
}

export function computeOptionAPrice(listPrice: number): number {
  return ceilToNearest5k(listPrice * 0.955);
}

export function computeOptionBPrice(listPrice: number): number {
  return ceilToNearest5k(listPrice * 0.975);
}

/** Snap a custom ask up to $5k increments; caller must still validate below list. */
export function computeCustomPrice(rawAmount: number): number {
  return ceilToNearest5k(rawAmount);
}

export function parseMoneyInput(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, "").trim();
  if (!cleaned) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function getPriceReductionOptions(listPrice: number): {
  optionA: number;
  optionB: number;
} {
  return {
    optionA: computeOptionAPrice(listPrice),
    optionB: computeOptionBPrice(listPrice),
  };
}

export function resolveRequestedPrice(
  listPrice: number,
  option: ReductionOption,
  customRaw?: string | null,
): { ok: true; newPrice: number } | { ok: false; error: string } {
  if (!Number.isFinite(listPrice) || listPrice <= 0) {
    return { ok: false, error: "List price isn’t available for this listing yet." };
  }

  let newPrice: number;
  if (option === "A") {
    newPrice = computeOptionAPrice(listPrice);
  } else if (option === "B") {
    newPrice = computeOptionBPrice(listPrice);
  } else {
    const parsed = parseMoneyInput(customRaw ?? "");
    if (parsed == null) {
      return { ok: false, error: "Please enter a valid custom price." };
    }
    newPrice = computeCustomPrice(parsed);
  }

  if (newPrice >= listPrice) {
    return {
      ok: false,
      error: "New price must be below the current list price after rounding to $5,000.",
    };
  }

  return { ok: true, newPrice };
}
