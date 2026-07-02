import type { Metadata } from "next";
import AccountOffersList from "@/components/account/AccountOffersList";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { getSellerOffers } from "@/lib/consumer/offers-query";
import { getSellerListingsScope } from "@/lib/consumer/seller-listings-scope";

export const metadata: Metadata = {
  title: "Offers — Glide RE",
};

export default async function AccountOffersPage() {
  const user = await getConsumerSession();
  if (!user) return null;

  const [offers, scope] = await Promise.all([
    getSellerOffers(user.id, user.email),
    getSellerListingsScope(user.id, user.email),
  ]);

  return (
    <>
      <AccountPageHeader
        title="Offers"
        description="Track offers submitted on your listings, including price, status, and buyer agent details."
      />
      <AccountOffersList offers={offers} multiListing={scope.listings.length > 1} />
    </>
  );
}
