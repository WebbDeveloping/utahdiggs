"use client";

import { FormEvent, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AdvancedFiltersDialog from "@/components/search/AdvancedFiltersDialog";
import type { SearchFilters } from "@/types/public-listing";

const PRICE_OPTIONS = [
  "",
  "100000",
  "300000",
  "500000",
  "700000",
  "900000",
  "2000000",
  "3000000",
];

const BED_OPTIONS = ["", "1", "2", "3", "4", "5", "6"];
const BATH_OPTIONS = ["", "1", "2", "3", "4", "5"];

type SearchHeaderProps = {
  filters: SearchFilters;
  onSearch: (updates: Partial<SearchFilters>) => void;
  onReset: () => void;
};

function FilterPopover({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <Button
        variant="outlined"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{ whiteSpace: "nowrap", minWidth: 110 }}
      >
        {label}
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box sx={{ p: 2, minWidth: 240 }}>{children}</Box>
      </Popover>
    </>
  );
}

export default function SearchHeader({ filters, onSearch, onReset }: SearchHeaderProps) {
  const [text, setText] = useState(filters.text ?? "");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSearch({ text: text.trim() || undefined, page: "1" });
  }

  function priceLabel() {
    const min = filters.minPrice ? `$${Number(filters.minPrice).toLocaleString()}` : "No Min";
    const max = filters.maxPrice ? `$${Number(filters.maxPrice).toLocaleString()}` : "No Max";
    if (!filters.minPrice && !filters.maxPrice) return "Any Price";
    return `${min} - ${max}`;
  }

  function bedsLabel() {
    return filters.minBeds ? `${filters.minBeds}+ Beds` : "Any Beds";
  }

  function bathsLabel() {
    return filters.minBaths ? `${filters.minBaths}+ Baths` : "Any Baths";
  }

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          px: { xs: 2, md: 3 },
          py: 2,
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.5}
          sx={{ alignItems: { xs: "stretch", lg: "center" } }}
        >
          <TextField
            fullWidth
            placeholder="Address, city, neighborhood, zip"
            value={text}
            onChange={(event) => setText(event.target.value)}
            autoComplete="off"
            sx={{ flex: 1 }}
          />

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
            <FilterPopover label={priceLabel()}>
              <Stack spacing={2}>
                <Typography variant="subtitle2">Min Price</Typography>
                <TextField
                  select
                  fullWidth
                  value={filters.minPrice ?? ""}
                  onChange={(event) =>
                    onSearch({ minPrice: event.target.value || undefined, page: "1" })
                  }
                >
                  <MenuItem value="">No Min</MenuItem>
                  {PRICE_OPTIONS.filter(Boolean).map((value) => (
                    <MenuItem key={`min-${value}`} value={value}>
                      ${Number(value).toLocaleString()}
                    </MenuItem>
                  ))}
                </TextField>
                <Typography variant="subtitle2">Max Price</Typography>
                <TextField
                  select
                  fullWidth
                  value={filters.maxPrice ?? ""}
                  onChange={(event) =>
                    onSearch({ maxPrice: event.target.value || undefined, page: "1" })
                  }
                >
                  <MenuItem value="">No Max</MenuItem>
                  {PRICE_OPTIONS.filter(Boolean).map((value) => (
                    <MenuItem key={`max-${value}`} value={value}>
                      ${Number(value).toLocaleString()}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </FilterPopover>

            <FilterPopover label={bedsLabel()}>
              <TextField
                select
                fullWidth
                label="Min Beds"
                value={filters.minBeds ?? ""}
                onChange={(event) =>
                  onSearch({ minBeds: event.target.value || undefined, page: "1" })
                }
              >
                <MenuItem value="">Any</MenuItem>
                {BED_OPTIONS.filter(Boolean).map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}+
                  </MenuItem>
                ))}
              </TextField>
            </FilterPopover>

            <FilterPopover label={bathsLabel()}>
              <TextField
                select
                fullWidth
                label="Min Baths"
                value={filters.minBaths ?? ""}
                onChange={(event) =>
                  onSearch({ minBaths: event.target.value || undefined, page: "1" })
                }
              >
                <MenuItem value="">Any</MenuItem>
                {BATH_OPTIONS.filter(Boolean).map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}+
                  </MenuItem>
                ))}
              </TextField>
            </FilterPopover>

            <Button
              variant="outlined"
              startIcon={<TuneIcon />}
              onClick={() => setAdvancedOpen(true)}
            >
              More
            </Button>

            <Button type="submit" variant="contained" sx={{ minWidth: 56, px: 2 }}>
              <SearchIcon />
            </Button>
          </Stack>
        </Stack>
      </Box>

      <AdvancedFiltersDialog
        open={advancedOpen}
        filters={filters}
        onClose={() => setAdvancedOpen(false)}
        onApply={(updates) => onSearch({ ...updates, page: "1" })}
        onReset={onReset}
      />
    </>
  );
}
