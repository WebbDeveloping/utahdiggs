import type { Metadata } from "next";
import Box from "@mui/material/Box";
import { Suspense } from "react";
import SiteHeader from "@/components/layout/SiteHeader";
import SearchPage from "@/components/search/SearchPage";

export const metadata: Metadata = {
  title: "Search Homes — Glide RE",
  description: "Search active Glide RE listings across Utah.",
};

export default function SearchRoutePage() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteHeader />
      <Box component="main" sx={{ flex: 1 }}>
        <Suspense fallback={null}>
          <SearchPage />
        </Suspense>
      </Box>
    </Box>
  );
}
