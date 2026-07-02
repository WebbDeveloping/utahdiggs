import type { Metadata } from "next";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import AccountWebTrafficList from "@/components/account/AccountWebTrafficList";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { getSellerLatestWeeklyStats } from "@/lib/consumer/weekly-stats-query";

export const metadata: Metadata = {
  title: "Web traffic — Glide RE",
};

export default async function AccountWebTrafficPage() {
  const user = await getConsumerSession();
  if (!user) return null;

  const stats = await getSellerLatestWeeklyStats(user.id, user.email);

  return (
    <>
      <AccountPageHeader
        title="Web traffic"
        description="Weekly listing views across UtahRealEstate.com, Zillow, Realtor.com, and other portals."
      />
      <AccountWebTrafficList stats={stats} />
    </>
  );
}
