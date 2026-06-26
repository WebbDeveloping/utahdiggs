import { normalizeEmail, validateEmail } from "@/lib/consumer/validation";

export type ListingInquiryType = "tour" | "info";

export type ListingInquiryInput = {
  listingId: string;
  type: ListingInquiryType;
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredDate: string;
};

export function parseListingInquiryFormData(formData: FormData): {
  input: ListingInquiryInput;
  fieldErrors: Record<string, string>;
} {
  const fieldErrors: Record<string, string> = {};
  const type = formData.get("type")?.toString();
  const listingId = formData.get("listingId")?.toString() ?? "";
  const name = formData.get("name")?.toString().trim() ?? "";
  const email = normalizeEmail(formData.get("email")?.toString() ?? "");
  const phone = formData.get("phone")?.toString().trim() ?? "";
  const message = formData.get("message")?.toString().trim() ?? "";
  const preferredDate = formData.get("preferredDate")?.toString().trim() ?? "";

  if (!listingId) {
    fieldErrors.listingId = "Listing is required.";
  }

  if (type !== "tour" && type !== "info") {
    fieldErrors.type = "Invalid request type.";
  }

  if (!name) {
    fieldErrors.name = "Name is required.";
  }

  const emailError = validateEmail(email);
  if (emailError) {
    fieldErrors.email = emailError;
  }

  if (!phone) {
    fieldErrors.phone = "Phone is required.";
  }

  if (type === "info" && !message) {
    fieldErrors.message = "Please include your question or request.";
  }

  const input: ListingInquiryInput = {
    listingId,
    type: type as ListingInquiryType,
    name,
    email,
    phone,
    message,
    preferredDate,
  };

  return { input, fieldErrors };
}
