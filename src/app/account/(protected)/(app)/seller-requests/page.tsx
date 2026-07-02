import type { Metadata } from "next";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import AccountPlaceholderPanel from "@/components/account/AccountPlaceholderPanel";

export const metadata: Metadata = {
  title: "Seller requests — Glide RE",
};

export default function AccountSellerRequestsPage() {
  return (
    <>
      <AccountPageHeader
        title="Seller requests"
        description="Submit and track requests for price changes, listing updates, and more."
      />
      <AccountPlaceholderPanel
        title="Seller requests coming soon"
        description="This page will let you submit requests to your agent for listing changes, status updates, and other seller needs."
      />
    </>
  );
}
