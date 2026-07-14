import type { Metadata } from "next";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import AccountYourMarketCards from "@/components/account/AccountYourMarketCards";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { getSellerMarketData } from "@/lib/consumer/market-data-query";

export const metadata: Metadata = {
  title: "Your market — Glide RE",
};

export default async function AccountYourMarketPage() {
  const user = await getConsumerSession();
  if (!user) return null;

  const markets = await getSellerMarketData(user.id, user.email);

  return (
    <>
      <AccountPageHeader
        title="Your market"
        description="City snapshot for where your listings sit — inventory, sales, and pricing context. Price coaching stays on Overview."
      />
      <AccountYourMarketCards markets={markets} />
    </>
  );
}
