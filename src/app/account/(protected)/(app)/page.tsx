import type { Metadata } from "next";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { getAccountDashboardStats } from "@/lib/consumer/account-dashboard-query";
import { getCustomerListings } from "@/lib/consumer/listings-query";
import AccountDashboard from "@/components/account/AccountDashboard";

export const metadata: Metadata = {
  title: "My account — Glide RE",
};

type AccountPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const user = await getConsumerSession();

  if (!user) {
    return null;
  }

  const params = await searchParams;
  const [listings, stats] = await Promise.all([
    getCustomerListings(user.id),
    getAccountDashboardStats(user.id, user.email),
  ]);

  return (
    <AccountDashboard
      user={user}
      listings={listings}
      stats={stats}
      draftSaved={getParam(params.draftSaved) === "1"}
    />
  );
}
