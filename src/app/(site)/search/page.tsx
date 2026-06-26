import { Suspense } from "react";
import SearchPage from "@/components/search/SearchPage";
import SitePageLayoutWithAuth from "@/components/layout/SitePageLayoutWithAuth";
import { createPageMetadata } from "@/lib/seo/metadata";
import { OG_IMAGES } from "@/lib/seo/site";

export const metadata = createPageMetadata({
  title: "Search Homes",
  description: "Browse active Glide RE listings across Utah.",
  path: "/search",
  ogImage: OG_IMAGES.search,
});

export default function SearchRoutePage() {
  return (
    <SitePageLayoutWithAuth>
      <Suspense fallback={null}>
        <SearchPage />
      </Suspense>
    </SitePageLayoutWithAuth>
  );
}
