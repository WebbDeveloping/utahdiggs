import type { Metadata } from "next";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import AccountShowingsList from "@/components/account/AccountShowingsList";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { getSellerListingsScope } from "@/lib/consumer/seller-listings-scope";
import { buildShowingsWeekChartData } from "@/lib/consumer/showings-chart-data";
import { getSellerShowings } from "@/lib/consumer/showings-query";

export const metadata: Metadata = {
  title: "Showings — Glide RE",
};

export default async function AccountShowingsPage() {
  const user = await getConsumerSession();
  if (!user) return null;

  const [showings, scope] = await Promise.all([
    getSellerShowings(user.id, user.email),
    getSellerListingsScope(user.id, user.email),
  ]);

  const weekChart = buildShowingsWeekChartData(showings, 8);

  return (
    <>
      <AccountPageHeader
        title="Showings"
        description="See scheduled showings and buyer feedback for your listings."
      />
      <AccountShowingsList
        showings={showings}
        multiListing={scope.listings.length > 1}
        weekChart={weekChart}
      />
    </>
  );
}
