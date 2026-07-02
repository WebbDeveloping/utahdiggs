import type { Metadata } from "next";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import AccountPlaceholderPanel from "@/components/account/AccountPlaceholderPanel";

export const metadata: Metadata = {
  title: "Web traffic — Glide RE",
};

export default function AccountWebTrafficPage() {
  return (
    <>
      <AccountPageHeader
        title="Web traffic"
        description="Track how buyers are finding and viewing your listing online."
      />
      <AccountPlaceholderPanel
        title="Web traffic coming soon"
        description="This page will show listing views, search impressions, photo gallery engagement, and traffic sources."
      />
    </>
  );
}
