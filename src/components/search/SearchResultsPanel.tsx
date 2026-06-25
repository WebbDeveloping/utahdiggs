"use client";

import CloseIcon from "@mui/icons-material/Close";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SaveSearchButton from "@/components/search/SaveSearchButton";
import PropertyCard from "@/components/search/PropertyCard";
import { SORT_OPTIONS } from "@/lib/search/search-params";
import type { PublicListing, SearchFilters, SearchSort } from "@/types/public-listing";

type ViewMode = "map" | "grid";

type SearchResultsPanelProps = {
  filters: SearchFilters;
  listings: PublicListing[];
  total: number;
  loading: boolean;
  viewMode: ViewMode;
  highlightedId: string | null;
  cardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (sort: SearchSort) => void;
  onRemoveTextFilter: () => void;
  onHover: (id: string | null) => void;
};

export default function SearchResultsPanel({
  filters,
  listings,
  total,
  loading,
  viewMode,
  highlightedId,
  cardRefs,
  onViewModeChange,
  onSortChange,
  onRemoveTextFilter,
  onHover,
}: SearchResultsPanelProps) {
  const isEmpty = !loading && total === 0;

  function resultsLabel() {
    if (loading) return "Searching...";
    if (total === 0) return "No homes for sale";
    return `${total} home${total === 1 ? "" : "s"} for sale`;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "background.paper",
        borderRight: { md: "1px solid" },
        borderColor: "divider",
      }}
    >
      <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Stack spacing={1.5}>
          {filters.text ? (
            <Chip
              label={filters.text}
              onDelete={onRemoveTextFilter}
              deleteIcon={<CloseIcon />}
            />
          ) : null}
          <Typography variant="body2" color={isEmpty ? "text.primary" : "text.secondary"}>
            {resultsLabel()}
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <ButtonGroup size="small" sx={{ display: { md: "none" } }}>
          <Button
            variant={viewMode === "map" ? "contained" : "outlined"}
            onClick={() => onViewModeChange("map")}
          >
            Map
          </Button>
          <Button
            variant={viewMode === "grid" ? "contained" : "outlined"}
            onClick={() => onViewModeChange("grid")}
          >
            Grid
          </Button>
        </ButtonGroup>

        <SaveSearchButton filters={filters} />

        <TextField
          select
          size="small"
          value={filters.sort ?? "date-desc"}
          onChange={(event) => onSortChange(event.target.value as SearchSort)}
          sx={{ minWidth: 220 }}
        >
          {SORT_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={32} />
          </Box>
        ) : isEmpty ? (
          <Box sx={{ py: 6, px: 2, textAlign: "center" }}>
            <HomeWorkOutlinedIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No homes for sale
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filters.text
                ? `We couldn't find any listings matching "${filters.text}".`
                : "There are no listings in this area right now."}{" "}
              Try adjusting your filters or zooming out on the map.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {listings.map((listing) => (
              <PropertyCard
                key={listing.id}
                listing={listing}
                highlighted={highlightedId === listing.id}
                cardRef={(element) => {
                  cardRefs.current[listing.id] = element;
                }}
                onHover={onHover}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
