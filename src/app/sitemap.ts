import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { PUBLIC_LISTING_STATUSES } from "@/lib/search/search-params";
import { SITE_URL } from "@/lib/seo/site";

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  {
    url: SITE_URL,
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: `${SITE_URL}/search`,
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${SITE_URL}/sell/inquiry`,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/terms`,
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${SITE_URL}/privacy`,
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await prisma.listing.findMany({
    where: {
      status: { in: [...PUBLIC_LISTING_STATUSES] },
    },
    select: {
      listingSlug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const listingRoutes: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${SITE_URL}/homes/${listing.listingSlug}`,
    lastModified: listing.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...STATIC_ROUTES, ...listingRoutes];
}
