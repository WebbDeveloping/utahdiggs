import type { Metadata } from "next";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import AccountSellerRequestsList from "@/components/account/AccountSellerRequestsList";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { getSellerListingsScope } from "@/lib/consumer/seller-listings-scope";
import { getSellerRequests } from "@/lib/consumer/seller-requests-query";

export const metadata: Metadata = {
  title: "Seller requests — Glide RE",
};

export default async function AccountSellerRequestsPage() {
  const user = await getConsumerSession();
  if (!user) return null;

  const [requests, scope] = await Promise.all([
    getSellerRequests(user.id, user.email),
    getSellerListingsScope(user.id, user.email),
  ]);

  return (
    <>
      <AccountPageHeader
        title="Seller requests"
        description="Track price change requests, open house requests, and messages you've sent to Blair."
      />
      <AccountSellerRequestsList
        requests={requests}
        multiListing={scope.listings.length > 1}
      />
    </>
  );
}
