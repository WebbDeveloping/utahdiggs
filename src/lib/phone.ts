const US_PHONE_DIGITS = 10;
const US_COUNTRY_CODE = "1";

function rawDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function digitsFromPhone(value: string): string {
  let digits = rawDigits(value);

  if (digits.length > US_PHONE_DIGITS && digits.startsWith(US_COUNTRY_CODE)) {
    digits = digits.slice(US_COUNTRY_CODE.length);
  }

  return digits.slice(0, US_PHONE_DIGITS);
}

function formatUsPhoneBody(digits: string): string {
  if (!digits) return "";

  if (digits.length <= 3) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function shouldShowUsCountryCode(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.startsWith("+")) return true;

  const digits = rawDigits(trimmed);
  return digits.length > US_PHONE_DIGITS && digits.startsWith(US_COUNTRY_CODE);
}

export function formatPhoneInput(value: string): string {
  const trimmed = value.trim();
  const digits = digitsFromPhone(value);

  if (!digits) {
    return trimmed.startsWith("+") ? "+" : "";
  }

  const body = formatUsPhoneBody(digits);
  return shouldShowUsCountryCode(value) ? `+1 ${body}` : body;
}

export function formatPhoneDisplay(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return formatPhoneInput(trimmed);
}
