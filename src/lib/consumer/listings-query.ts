import { prisma } from "@/lib/db";
import type { CustomerListingSummary } from "@/types/consumer-listing";

export async function getCustomerListings(
  customerId: string,
): Promise<CustomerListingSummary[]> {
  const listings = await prisma.listing.findMany({
    where: { customerId },
    orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      listPrice: true,
      status: true,
      portalSlug: true,
      submittedAt: true,
      createdAt: true,
      documents: {
        orderBy: { uploadedAt: "asc" },
        take: 1,
        select: { url: true },
      },
    },
  });

  return listings.map((listing) => ({
    id: listing.id,
    address: listing.address,
    city: listing.city,
    state: listing.state,
    listPrice: listing.listPrice?.toString() ?? null,
    status: listing.status,
    portalSlug: listing.portalSlug,
    primaryPhotoUrl: listing.documents[0]?.url ?? null,
    submittedAt: listing.submittedAt,
    createdAt: listing.createdAt,
  }));
}
