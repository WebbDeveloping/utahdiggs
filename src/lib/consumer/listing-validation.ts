import { MAX_PHOTO_COUNT } from "@/lib/storage/blob";
import type {
  ConsumerCreateListingFieldErrors,
  ConsumerCreateListingInput,
} from "@/types/consumer-listing";
import type { PhotoInput } from "@/types/crm-listing";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseOptionalNumber(
  value: string,
  field: keyof ConsumerCreateListingFieldErrors,
  errors: ConsumerCreateListingFieldErrors,
): number | undefined {
  if (!value) return undefined;
  const num = Number(value.replace(/,/g, ""));
  if (Number.isNaN(num)) {
    errors[field] = "Enter a valid number.";
    return undefined;
  }
  return num;
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function parseConsumerListingFormData(formData: FormData): {
  input: ConsumerCreateListingInput;
  fieldErrors: ConsumerCreateListingFieldErrors;
} {
  const fieldErrors: ConsumerCreateListingFieldErrors = {};

  const address = asString(formData.get("address"));
  const city = asString(formData.get("city"));
  const state = asString(formData.get("state"));
  const zip = asString(formData.get("zip"));

  const sellerName = asString(formData.get("sellerName"));
  const sellerEmail = asString(formData.get("sellerEmail"));
  const sellerPhone = asString(formData.get("sellerPhone"));

  if (!address) fieldErrors.address = "Address is required.";
  if (!city) fieldErrors.city = "City is required.";
  if (!state) fieldErrors.state = "State is required.";
  else if (!/^[A-Za-z]{2}$/.test(state)) {
    fieldErrors.state = "Enter a 2-letter state code.";
  }
  if (!zip) fieldErrors.zip = "Zip is required.";

  if (!sellerName) fieldErrors.sellerName = "Name is required.";
  if (!sellerEmail) fieldErrors.sellerEmail = "Email is required.";
  else if (!EMAIL_RE.test(sellerEmail)) {
    fieldErrors.sellerEmail = "Enter a valid email address.";
  }
  if (!sellerPhone) fieldErrors.sellerPhone = "Phone is required.";
  else if (sellerPhone.replace(/\D/g, "").length < 10) {
    fieldErrors.sellerPhone = "Phone must have at least 10 digits.";
  }

  const listPrice = parseOptionalNumber(
    asString(formData.get("listPrice")),
    "listPrice",
    fieldErrors,
  );

  const photos: PhotoInput[] = [];
  const photoCount = Number(asString(formData.get("photoCount")) || "0");

  if (photoCount > MAX_PHOTO_COUNT) {
    fieldErrors.photos = `A listing can have at most ${MAX_PHOTO_COUNT} photos.`;
  }

  for (let i = 0; i < photoCount; i++) {
    const name = asString(formData.get(`photoName${i}`));
    const url = asString(formData.get(`photoUrl${i}`));
    if (!name && !url) continue;

    if (!name) {
      fieldErrors[`photoName${i}`] =
        "Photo name is required when a file is uploaded.";
    }
    if (!url) {
      fieldErrors[`photoUrl${i}`] =
        "Upload the photo before submitting the listing.";
    } else if (!isValidUrl(url)) {
      fieldErrors[`photoUrl${i}`] = "Enter a valid photo URL.";
    }

    if (name && url && isValidUrl(url)) {
      photos.push({ name, url });
    }
  }

  if (photos.length === 0 && !fieldErrors.photos) {
    fieldErrors.photos = "Add at least one photo.";
  }

  if (photos.length > MAX_PHOTO_COUNT) {
    fieldErrors.photos = `A listing can have at most ${MAX_PHOTO_COUNT} photos.`;
  }

  const input: ConsumerCreateListingInput = {
    address,
    city,
    state,
    zip,
    listPrice,
    beds: asString(formData.get("beds")) || undefined,
    baths: asString(formData.get("baths")) || undefined,
    sqft: asString(formData.get("sqft")) || undefined,
    description: asString(formData.get("description")) || undefined,
    sellerName,
    sellerEmail,
    sellerPhone,
    photos,
  };

  return { input, fieldErrors };
}
