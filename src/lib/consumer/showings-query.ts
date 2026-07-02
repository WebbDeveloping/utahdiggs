import { prisma } from "@/lib/db";
import { getSellerListingsScope } from "@/lib/consumer/seller-listings-scope";
import type { ConsumerShowingRow } from "@/types/consumer-account-data";

export async function getSellerShowings(
  customerId: string,
  email: string,
): Promise<ConsumerShowingRow[]> {
  const { listingIds, listings } = await getSellerListingsScope(customerId, email);
  if (listingIds.length === 0) return [];

  const listingById = new Map(listings.map((listing) => [listing.id, listing]));

  const showings = await prisma.showing.findMany({
    where: { listingId: { in: listingIds } },
    orderBy: [{ showingDate: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      listingId: true,
      showingDate: true,
      showingTime: true,
      showingLabel: true,
      buyersAgent: true,
      feedback: true,
    },
  });

  return showings.map((showing) => {
    const listing = listingById.get(showing.listingId);
    return {
      id: showing.id,
      listingId: showing.listingId,
      listingAddress: listing?.address ?? "Unknown",
      listingCity: listing?.city ?? "",
      showingDate: showing.showingDate,
      showingTime: showing.showingTime,
      showingLabel: showing.showingLabel,
      buyersAgent: showing.buyersAgent,
      feedback: showing.feedback,
    };
  });
}

export async function getSellerShowingsSince(
  customerId: string,
  email: string,
  since: Date,
): Promise<ConsumerShowingRow[]> {
  const showings = await getSellerShowings(customerId, email);
  return showings.filter((showing) => showing.showingDate >= since);
}
