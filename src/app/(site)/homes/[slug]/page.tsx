import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListingDetailContent from "@/components/search/ListingDetailContent";
import SitePageLayoutWithAuth from "@/components/layout/SitePageLayoutWithAuth";
import { getPublicListingBySlug } from "@/lib/search/listings-query";
import { formatPrice } from "@/lib/search/format";
import { createPageMetadata } from "@/lib/seo/metadata";

type ListingPageProps = {
  params: Promise<{ slug: string }>;
};

function buildListingDescription(listing: {
  beds: string | null;
  baths: string | null;
  sqft: string | null;
  city: string;
  listPrice: number | null;
}): string {
  const parts: string[] = [];

  if (listing.beds) parts.push(`${listing.beds} bed`);
  if (listing.baths) parts.push(`${listing.baths} bath`);
  if (listing.sqft) parts.push(`${listing.sqft} sq ft`);

  const specs = parts.length > 0 ? `${parts.join(" · ")} home` : "Home";
  return `${specs} in ${listing.city}, Utah — ${formatPrice(listing.listPrice)}. View photos, details, and property information on Glide RE.`;
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getPublicListingBySlug(slug);

  if (!listing) {
    return createPageMetadata({
      title: "Listing Not Found",
      description: "This listing could not be found.",
      path: `/homes/${slug}`,
      noIndex: true,
    });
  }

  const title = `${listing.address} — ${formatPrice(listing.listPrice)}`;
  const primaryPhoto = listing.photos[0]?.url;

  return createPageMetadata({
    title,
    description: buildListingDescription(listing),
    path: `/homes/${slug}`,
    ogImage: primaryPhoto ?? undefined,
  });
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
