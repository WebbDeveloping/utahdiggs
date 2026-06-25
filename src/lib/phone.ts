const US_PHONE_DIGITS = 10;

export function digitsFromPhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, US_PHONE_DIGITS);
}

export function formatPhoneInput(value: string): string {
  const digits = digitsFromPhone(value);
  if (!digits) return "";

  if (digits.length <= 3) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function formatPhoneDisplay(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return formatPhoneInput(trimmed);
}
