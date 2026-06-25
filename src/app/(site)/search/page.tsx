import type { Metadata } from "next";
import { Suspense } from "react";
import SearchPage from "@/components/search/SearchPage";
import SitePageLayoutWithAuth from "@/components/layout/SitePageLayoutWithAuth";

export const metadata: Metadata = {
  title: "Search Homes — Glide RE",
  description: "Search active Glide RE listings across Utah.",
};

export default function SearchRoutePage() {
  return (
    <SitePageLayoutWithAuth>
      <Suspense fallback={null}>
        <SearchPage />
      </Suspense>
    </SitePageLayoutWithAuth>
  );
}
