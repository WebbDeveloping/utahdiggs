import type { Metadata } from "next";
import AccountDocumentsList from "@/components/account/AccountDocumentsList";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { getCustomerDocumentsByListing } from "@/lib/consumer/listing-documents-query";

export const metadata: Metadata = {
  title: "Documents — Glide RE",
};

export default async function AccountDocumentsPage() {
  const user = await getConsumerSession();
  if (!user) return null;

  const listings = await getCustomerDocumentsByListing(user.id);

  return (
    <>
      <AccountPageHeader
        title="Documents"
        description="View and download your listing agreements, disclosures, and transaction paperwork across all properties."
      />
      <AccountDocumentsList listings={listings} />
    </>
  );
}
