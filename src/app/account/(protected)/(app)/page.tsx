import type { Metadata } from "next";
import { Suspense } from "react";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { getAccountOverviewData } from "@/lib/consumer/listing-overview-metrics";
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
  const listingIdParam = getParam(params.listing) ?? null;

  const [listings, overview] = await Promise.all([
    getCustomerListings(user.id),
    getAccountOverviewData(user.id, user.email, listingIdParam),
  ]);

  const mlsPromptListingId =
    getParam(params.mlsPrompt) === "1" ? (getParam(params.listing) ?? null) : null;

  return (
    <Suspense fallback={null}>
      <AccountDashboard
        user={user}
        listings={listings}
        metrics={overview.metrics}
        priceHealth={overview.priceHealth}
        pendingOffer={overview.pendingOffer}
        recentShowings={overview.recentShowings}
        marketTeaser={overview.marketTeaser}
        selectableListings={overview.selectableListings}
        draftSaved={getParam(params.draftSaved) === "1"}
        submitted={getParam(params.submitted) === "1"}
        mlsPromptListingId={mlsPromptListingId}
      />
    </Suspense>
  );
}
