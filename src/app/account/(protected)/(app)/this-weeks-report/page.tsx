import type { Metadata } from "next";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import AccountPlaceholderPanel from "@/components/account/AccountPlaceholderPanel";

export const metadata: Metadata = {
  title: "This week's report — Glide RE",
};

export default function ThisWeeksReportPage() {
  return (
    <>
      <AccountPageHeader
        title="This week's report"
        description="Weekly updates on your listing activity, market trends, and next steps."
      />
      <AccountPlaceholderPanel
        title="Weekly report coming soon"
        description="This page will show your personalized weekly seller report with listing performance, showing feedback, and market insights."
      />
    </>
  );
}
