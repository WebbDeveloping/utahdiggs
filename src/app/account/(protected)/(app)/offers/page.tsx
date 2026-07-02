import type { Metadata } from "next";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import AccountPlaceholderPanel from "@/components/account/AccountPlaceholderPanel";

export const metadata: Metadata = {
  title: "Offers — Glide RE",
};

export default function AccountOffersPage() {
  return (
    <>
      <AccountPageHeader
        title="Offers"
        description="Review incoming offers and track negotiation status."
      />
      <AccountPlaceholderPanel
        title="Offers coming soon"
        description="This page will list all offers across your listings with status updates, terms, and accept/decline actions."
      />
    </>
  );
}
