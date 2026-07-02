export const LISTING_AGREEMENT_SIGNED_NAME =
  "Exclusive Right to Sell Listing Agreement (Signed)" as const;

export const MLS_INPUT_SIGNATURE_NAME = "MLS Input Signature" as const;

/** @deprecated Legacy name used before UAR Form 8 rollout */
export const LEGACY_LISTING_AGREEMENT_SIGNED_NAME = "Listing Agreement (Signed)" as const;

export function isListingAgreementDocument(name: string): boolean {
  return (
    name === LISTING_AGREEMENT_SIGNED_NAME ||
    name === LEGACY_LISTING_AGREEMENT_SIGNED_NAME
  );
}

export function findSignedListingAgreementDocument<
  T extends { id: string; name: string },
>(documents: T[]): T | undefined {
  return documents.find((document) => isListingAgreementDocument(document.name));
}
