export const TRADITIONAL_LISTING_RATE = 0.03;
export const MIN_LISTING_FEE = 4500;

export const HOME_VALUE_MIN = 350_000;
export const HOME_VALUE_MAX = 2_000_000;
export const HOME_VALUE_STEP = 25_000;
export const HOME_VALUE_DEFAULT = 525_000;

export const SAVINGS_PLANS = {
  virtual: { id: "virtual" as const, label: "Virtual", rate: 0.01 },
  "full-service": { id: "full-service" as const, label: "Full Service", rate: 0.015 },
} as const;

export type SavingsPlanId = keyof typeof SAVINGS_PLANS;

export type SavingsResult = {
  fee: number;
  traditionalFee: number;
  savings: number;
};

export function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function formatHomeValueSlider(value: number): string {
  if (value >= HOME_VALUE_MAX) {
    return "$2,000,000+";
  }
  return formatCurrency(value);
}

export function calculateSavings(homeValue: number, planRate: number): SavingsResult {
  const fee = Math.max(homeValue * planRate, MIN_LISTING_FEE);
  const traditionalFee = homeValue * TRADITIONAL_LISTING_RATE;
  const savings = traditionalFee - fee;

  return { fee, traditionalFee, savings };
}
