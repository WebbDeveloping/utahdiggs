import type { Metadata } from "next";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import AccountPlaceholderPanel from "@/components/account/AccountPlaceholderPanel";

export const metadata: Metadata = {
  title: "Your market — Glide RE",
};

export default function AccountYourMarketPage() {
  return (
    <>
      <AccountPageHeader
        title="Your market"
        description="Local market trends, comparable sales, and pricing insights for your area."
      />
      <AccountPlaceholderPanel
        title="Market insights coming soon"
        description="This page will provide neighborhood trends, recent comparable sales, and pricing recommendations for your listing."
      />
    </>
  );
}
