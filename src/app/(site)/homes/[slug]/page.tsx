import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListingDetailContent from "@/components/search/ListingDetailContent";
import SitePageLayoutWithAuth from "@/components/layout/SitePageLayoutWithAuth";
import { getPublicListingBySlug } from "@/lib/search/listings-query";
import { formatAddress, formatPrice } from "@/lib/search/format";

type ListingPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getPublicListingBySlug(slug);

  if (!listing) {
    return { title: "Listing Not Found — Glide RE" };
  }

  return {
    title: `${formatPrice(listing.listPrice)} — ${listing.address} — Glide RE`,
    description: `View details for ${formatAddress(listing)}.`,
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params;
  const listing = await getPublicListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  return (
    <SitePageLayoutWithAuth>
      <ListingDetailContent listing={listing} />
    </SitePageLayoutWithAuth>
  );
}
