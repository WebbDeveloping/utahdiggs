export type SellInquiryInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  /** Retained for DB compatibility; UI no longer collects a timeline. */
  timeline: string;
};

export type SellInquiryFieldErrors = Partial<
  Record<keyof SellInquiryInput | "password" | "confirmPassword", string>
>;

const TIMELINE_NOT_SPECIFIED = "Not specified";

export function parseSellInquiryFormData(formData: FormData): {
  input: SellInquiryInput;
  fieldErrors: SellInquiryFieldErrors;
} {
  const fieldErrors: SellInquiryFieldErrors = {};

  const firstName = asString(formData.get("firstName"));
  const lastName = asString(formData.get("lastName"));
  const email = asString(formData.get("email")).toLowerCase();
  const phone = asString(formData.get("phone"));
  const streetAddress = asString(formData.get("streetAddress"));
  const city = asString(formData.get("city"));
  const state = asString(formData.get("state"));
  const zip = asString(formData.get("zip"));
  const timeline = asString(formData.get("timeline")) || TIMELINE_NOT_SPECIFIED;

  if (!firstName) fieldErrors.firstName = "First name is required.";
  if (!lastName) fieldErrors.lastName = "Last name is required.";

  if (!email) {
    fieldErrors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!phone) fieldErrors.phone = "Phone is required.";

  if (!streetAddress) fieldErrors.streetAddress = "Street address is required.";
  if (!city) fieldErrors.city = "City is required.";
  if (!state) fieldErrors.state = "State is required.";

  if (!zip) {
    fieldErrors.zip = "Zip code is required.";
  } else if (!/^\d{5}$/.test(zip)) {
    fieldErrors.zip = "Enter a valid 5-digit zip code.";
  }

  return {
    input: {
      firstName,
      lastName,
      email,
      phone,
      streetAddress,
      city,
      state,
      zip,
      timeline,
    },
    fieldErrors,
  };
}

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}
