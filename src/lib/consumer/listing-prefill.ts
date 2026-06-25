export type ListingPrefillInput = {
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  inquiryId?: string;
};

export type ListingPrefillValues = {
  address: string;
  city: string;
  state: string;
  zip: string;
  inquiryId?: string;
};

const STATE_NAME_TO_CODE: Record<string, string> = {
  utah: "UT",
};

export function normalizeInquiryState(state: string): string {
  const trimmed = state.trim();
  if (/^[A-Za-z]{2}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  return STATE_NAME_TO_CODE[trimmed.toLowerCase()] ?? trimmed.toUpperCase();
}

export function buildListingPrefillSearchParams(
  input: ListingPrefillInput,
): string {
  const params = new URLSearchParams();
  params.set("address", input.streetAddress.trim());
  params.set("city", input.city.trim());
  params.set("state", normalizeInquiryState(input.state));
  params.set("zip", input.zip.trim());

  if (input.inquiryId) {
    params.set("inquiryId", input.inquiryId);
  }

  return params.toString();
}

export function buildListingPrefillPath(input: ListingPrefillInput): string {
  const query = buildListingPrefillSearchParams(input);
  return `/account/listings/new?${query}`;
}

export function buildMlsInputPrefillPath(input: ListingPrefillInput): string {
  const query = buildListingPrefillSearchParams(input);
  return `/account/listings/new/mls-input?${query}`;
}

export function buildMlsInputDraftPath(listingId: string): string {
  return `/account/listings/new/mls-input?draft=${encodeURIComponent(listingId)}`;
}

export function parseListingPrefillFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): ListingPrefillValues | null {
  const address = getParam(searchParams.address);
  const city = getParam(searchParams.city);
  const state = getParam(searchParams.state);
  const zip = getParam(searchParams.zip);
  const inquiryId = getParam(searchParams.inquiryId);

  if (!address && !city && !state && !zip && !inquiryId) {
    return null;
  }

  return {
    address: address ?? "",
    city: city ?? "",
    state: state ? normalizeInquiryState(state) : "",
    zip: zip ?? "",
    inquiryId: inquiryId ?? undefined,
  };
}

function getParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0]?.trim() || undefined;
  }
  return value?.trim() || undefined;
}
