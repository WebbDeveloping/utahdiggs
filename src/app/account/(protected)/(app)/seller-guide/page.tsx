import type { Metadata } from "next";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import SellerGuideContent from "@/components/account/SellerGuideContent";

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
      <SellerGuideContent />
    </>
  );
}
