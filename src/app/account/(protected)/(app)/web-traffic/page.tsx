import type { Metadata } from "next";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import AccountWebTrafficList from "@/components/account/AccountWebTrafficList";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import {
  buildPortalBreakdownChartData,
  buildViewsTrendChartData,
} from "@/lib/consumer/web-traffic-chart-data";
import {
  getSellerLatestWeeklyStats,
  getSellerWeeklyStatHistory,
} from "@/lib/consumer/weekly-stats-query";

export const metadata: Metadata = {
  title: "Web traffic — Glide RE",
};

export default async function AccountWebTrafficPage() {
  const user = await getConsumerSession();
  if (!user) return null;

  const [stats, history] = await Promise.all([
    getSellerLatestWeeklyStats(user.id, user.email),
    getSellerWeeklyStatHistory(user.id, user.email, 8),
  ]);

  const viewsTrend = buildViewsTrendChartData(history, 8);
  const portalBreakdowns = buildPortalBreakdownChartData(stats);

  return (
    <>
      <AccountPageHeader
        title="Web traffic"
        description="Weekly listing views across UtahRealEstate.com, Zillow, Realtor.com, and other portals."
      />
      <AccountWebTrafficList
        stats={stats}
        viewsTrend={viewsTrend}
        portalBreakdowns={portalBreakdowns}
      />
    </>
  );
}
