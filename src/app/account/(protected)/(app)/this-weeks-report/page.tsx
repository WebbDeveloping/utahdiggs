import type { Metadata } from "next";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import AccountWeeklyReport from "@/components/account/AccountWeeklyReport";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { getWeeklyReportData } from "@/lib/consumer/account-dashboard-query";
import { getSellerListingsScope } from "@/lib/consumer/seller-listings-scope";

export const metadata: Metadata = {
  title: "This week's report — Glide RE",
};

export default async function AccountThisWeeksReportPage() {
  const user = await getConsumerSession();
  if (!user) return null;

  const [report, scope] = await Promise.all([
    getWeeklyReportData(user.id, user.email),
    getSellerListingsScope(user.id, user.email),
  ]);

  return (
    <>
      <AccountPageHeader
        title="This week's report"
        description="Your personalized weekly summary — Blair's note, web traffic, and recent showing activity."
      />
      <AccountWeeklyReport report={report} multiListing={scope.listings.length > 1} />
    </>
  );
}
