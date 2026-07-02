import type { Metadata } from "next";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import AccountPlaceholderPanel from "@/components/account/AccountPlaceholderPanel";

export const metadata: Metadata = {
  title: "Seller guide — Glide RE",
};

export default function AccountSellerGuidePage() {
  return (
    <>
      <AccountPageHeader
        title="Seller guide"
        description="Tips and resources to help you through the selling process."
      />
      <AccountPlaceholderPanel
        title="Seller guide coming soon"
        description="This page will include step-by-step guidance on preparing your home, navigating offers, and closing successfully."
      />
    </>
  );
}
