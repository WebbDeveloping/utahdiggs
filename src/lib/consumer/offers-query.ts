import { prisma } from "@/lib/db";
import { getSellerListingsScope } from "@/lib/consumer/seller-listings-scope";
import type { ConsumerOfferRow } from "@/types/consumer-account-data";

export async function getSellerOffers(
  customerId: string,
  email: string,
): Promise<ConsumerOfferRow[]> {
  const { listingIds, listings } = await getSellerListingsScope(customerId, email);
  if (listingIds.length === 0) return [];

  const listingById = new Map(listings.map((listing) => [listing.id, listing]));

  const offers = await prisma.offer.findMany({
    where: { listingId: { in: listingIds } },
    orderBy: { submittedDate: "desc" },
    select: {
      id: true,
      listingId: true,
      submittedDate: true,
      offerPrice: true,
      buyersAgent: true,
      status: true,
    },
  });

  return offers.map((offer) => {
    const listing = listingById.get(offer.listingId);
    return {
      id: offer.id,
      listingId: offer.listingId,
      listingAddress: listing?.address ?? "Unknown",
      listingCity: listing?.city ?? "",
      listPrice: listing?.listPrice ?? null,
      submittedDate: offer.submittedDate,
      offerPrice: offer.offerPrice?.toString() ?? null,
      buyersAgent: offer.buyersAgent,
      status: offer.status,
    };
  });
}
