"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter, useSearchParams } from "next/navigation";
import SearchHeader from "@/components/search/SearchHeader";
import SearchResultsPanel from "@/components/search/SearchResultsPanel";
import { DEFAULT_ZOOM, hasValidMapCoordinates, UTAH_CENTER } from "@/lib/search/format";
import { buildSearchQueryString, parseSearchParams } from "@/lib/search/search-params";
import type {
  GeocodeResult,
  PublicListing,
  SearchFilters,
  SearchListingsResponse,
  SearchSort,
} from "@/types/public-listing";

const SearchMap = dynamic(() => import("@/components/search/SearchMap"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "action.hover",
      }}
    >
      <CircularProgress />
    </Box>
  ),
});

type ViewMode = "map" | "grid";

function filtersKey(filters: SearchFilters) {
  const { bbox: _bbox, page: _page, ...rest } = filters;
  return JSON.stringify(rest);
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => parseSearchParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const [listings, setListings] = useState<PublicListing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(UTAH_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [shouldFitListings, setShouldFitListings] = useState(true);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const boundsTimeoutRef = useRef<number | null>(null);
  const skipInitialBoundsRef = useRef(true);
  const lastFiltersKey = useRef(filtersKey(filters));

  const updateFilters = useCallback(
    (updates: Partial<SearchFilters>) => {
      const next: SearchFilters = {
        ...filters,
        ...updates,
        page: updates.page ?? "1",
      };

      if (!("bbox" in updates)) {
        delete next.bbox;
      }

      const query = buildSearchQueryString(next);
      router.push(query ? `/search?${query}` : "/search");
    },
    [filters, router],
  );

  useEffect(() => {
    const currentKey = filtersKey(filters);
    if (currentKey !== lastFiltersKey.current) {
      setShouldFitListings(true);
      lastFiltersKey.current = currentKey;
    }
  }, [filters]);

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      setLoading(true);
      try {
        const query = buildSearchQueryString(filters);
        const response = await fetch(`/api/search/listings?${query}`);
        if (!response.ok) throw new Error("Failed to load listings");
        const data = (await response.json()) as SearchListingsResponse;
        if (!cancelled) {
          setListings(data.listings);
          setTotal(data.total);
        }
      } catch {
        if (!cancelled) {
          setListings([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadListings();
    return () => {
      cancelled = true;
    };
  }, [filters]);

  useEffect(() => {
    if (!filters.text?.trim()) return;

    let cancelled = false;

    async function geocode() {
      try {
        const response = await fetch(
          `/api/geocode?q=${encodeURIComponent(filters.text!.trim())}`,
        );
        if (!response.ok) return;
        const data = (await response.json()) as GeocodeResult;
        if (
          !cancelled &&
          Number.isFinite(data.lat) &&
          Number.isFinite(data.lng)
        ) {
          setMapCenter([data.lat, data.lng]);
          setMapZoom(11);
        }
      } catch {
        // Keep default center when geocoding fails.
      }
    }

    geocode();
    return () => {
      cancelled = true;
    };
  }, [filters.text]);

  useEffect(() => {
    if (!shouldFitListings || filters.bbox) return;

    const coords = listings
      .filter(hasValidMapCoordinates)
      .map((listing) => [listing.latitude, listing.longitude] as [number, number]);

    if (coords.length === 1) {
      setMapCenter(coords[0]);
      setMapZoom(14);
      setShouldFitListings(false);
      return;
    }

    if (coords.length > 1) {
      const lats = coords.map(([lat]) => lat);
      const lngs = coords.map(([, lng]) => lng);
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      setMapCenter([centerLat, centerLng]);
      setMapZoom(12);
      setShouldFitListings(false);
    }
  }, [listings, shouldFitListings, filters.bbox]);

  function handleBoundsChange(bbox: string) {
    if (skipInitialBoundsRef.current) {
      skipInitialBoundsRef.current = false;
      return;
    }

    if (boundsTimeoutRef.current) {
      window.clearTimeout(boundsTimeoutRef.current);
    }

    boundsTimeoutRef.current = window.setTimeout(() => {
      setShouldFitListings(false);
      updateFilters({ bbox, page: "1" });
    }, 400);
  }

  function handleReset() {
    router.push("/search");
  }

  function handleMarkerClick(id: string) {
    const element = cardRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setHighlightedId(id);
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 68px)" }}>
      <SearchHeader
        filters={filters}
        onSearch={(updates) => updateFilters(updates)}
        onReset={handleReset}
      />

      <Box sx={{ position: "relative", flex: 1, minHeight: 0, zIndex: 0 }}>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            isolation: "isolate",
            display: { xs: viewMode === "map" ? "block" : "none", md: "block" },
          }}
        >
          <SearchMap
            listings={listings}
            center={mapCenter}
            zoom={mapZoom}
            highlightedId={highlightedId}
            onBoundsChange={handleBoundsChange}
            onMarkerClick={handleMarkerClick}
            onMarkerHover={setHighlightedId}
          />
        </Box>

        <Box
          sx={{
            position: { xs: "relative", md: "absolute" },
            top: { md: 0 },
            left: { md: 0 },
            width: { xs: "100%", md: 420 },
            height: { xs: viewMode === "grid" ? "100%" : 0, md: "100%" },
            zIndex: 1,
            pointerEvents: "auto",
            overflow: { xs: viewMode === "grid" ? "visible" : "hidden", md: "visible" },
            boxShadow: { md: "4px 0 24px rgba(19,33,28,0.08)" },
          }}
        >
          <SearchResultsPanel
            filters={filters}
            listings={listings}
            total={total}
            loading={loading}
            viewMode={viewMode}
            highlightedId={highlightedId}
            cardRefs={cardRefs}
            onViewModeChange={setViewMode}
            onSortChange={(sort: SearchSort) => updateFilters({ sort, page: "1" })}
            onRemoveTextFilter={() => updateFilters({ text: undefined, page: "1" })}
            onHover={setHighlightedId}
          />
        </Box>
      </Box>
    </Box>
  );
}
