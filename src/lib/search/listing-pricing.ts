/** Default assumptions for estimated monthly payment (P&I only). */
export const DEFAULT_DOWN_PAYMENT_PCT = 0.2;
export const DEFAULT_ANNUAL_INTEREST_RATE = 0.065;
export const DEFAULT_LOAN_TERM_YEARS = 30;

export type EstimateMonthlyPaymentOptions = {
  downPaymentPct?: number;
  annualInterestRate?: number;
  loanTermYears?: number;
};

export function parseSqft(sqft: string | null | undefined): number | null {
  if (!sqft) return null;
  const parsed = parseFloat(sqft.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export function formatPricePerSqft(
  listPrice: number | null,
  sqft: string | null,
): string | null {
  if (listPrice == null || listPrice <= 0) return null;
  const sqftNum = parseSqft(sqft);
  if (sqftNum == null) return null;
  const perSqft = Math.round(listPrice / sqftNum);
  return `$${perSqft.toLocaleString("en-US")} per ft²`;
}

export function estimateMonthlyPayment(
  listPrice: number | null,
  options: EstimateMonthlyPaymentOptions = {},
): number | null {
  if (listPrice == null || listPrice <= 0) return null;

  const downPaymentPct = options.downPaymentPct ?? DEFAULT_DOWN_PAYMENT_PCT;
  const annualInterestRate = options.annualInterestRate ?? DEFAULT_ANNUAL_INTEREST_RATE;
  const loanTermYears = options.loanTermYears ?? DEFAULT_LOAN_TERM_YEARS;

  const loanAmount = listPrice * (1 - downPaymentPct);
  if (loanAmount <= 0) return null;

  const monthlyRate = annualInterestRate / 12;
  const numPayments = loanTermYears * 12;

  if (monthlyRate === 0) {
    return Math.round(loanAmount / numPayments);
  }

  const factor = Math.pow(1 + monthlyRate, numPayments);
  const payment = (loanAmount * monthlyRate * factor) / (factor - 1);
  return Math.round(payment);
}

export function formatEstimatedPayment(listPrice: number | null): string | null {
  const payment = estimateMonthlyPayment(listPrice);
  if (payment == null) return null;
  return `$${payment.toLocaleString("en-US")}/mo`;
}
