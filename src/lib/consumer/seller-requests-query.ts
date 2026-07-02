import { prisma } from "@/lib/db";
import { getSellerListingsScope } from "@/lib/consumer/seller-listings-scope";
import type { ConsumerSellerRequestRow } from "@/types/consumer-account-data";

export async function getSellerRequests(
  customerId: string,
  email: string,
): Promise<ConsumerSellerRequestRow[]> {
  const { listingIds, listings } = await getSellerListingsScope(customerId, email);
  if (listingIds.length === 0) return [];

  const listingById = new Map(listings.map((listing) => [listing.id, listing]));

  const requests = await prisma.sellerRequest.findMany({
    where: { listingId: { in: listingIds } },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      listingId: true,
      submittedAt: true,
      status: true,
      requestSummary: true,
      updateTypes: true,
    },
  });

  return requests.map((request) => {
    const listing = listingById.get(request.listingId);
    return {
      id: request.id,
      listingId: request.listingId,
      listingAddress: listing?.address ?? "Unknown",
      listingCity: listing?.city ?? "",
      submittedAt: request.submittedAt,
      status: request.status,
      requestSummary: request.requestSummary,
      updateTypes: request.updateTypes,
    };
  });
}
