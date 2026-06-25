import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import ListingDetailContent from "@/components/search/ListingDetailContent";
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
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteHeader />
      <Box component="main" sx={{ flex: 1 }}>
        <ListingDetailContent listing={listing} />
      </Box>
      <SiteFooter />
    </Box>
  );
}
