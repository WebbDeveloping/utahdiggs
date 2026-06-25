"use client";

import { useEffect, useState } from "react";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { buildSearchQueryString } from "@/lib/search/search-params";
import {
  getSavedSearches,
  removeSavedSearch,
  saveSearch,
  type SavedSearch,
} from "@/lib/search/saved-searches";
import type { SearchFilters } from "@/types/public-listing";

type SaveSearchButtonProps = {
  filters: SearchFilters;
};

export default function SaveSearchButton({ filters }: SaveSearchButtonProps) {
  const router = useRouter();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    setSavedSearches(getSavedSearches());
  }, []);

  function handleSave() {
    saveSearch(filters);
    setSavedSearches(getSavedSearches());
  }

  function handleOpenSaved(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
    setSavedSearches(getSavedSearches());
  }

  function handleLoad(search: SavedSearch) {
    const query = buildSearchQueryString(search.filters);
    router.push(query ? `/search?${query}` : "/search");
    setAnchorEl(null);
  }

  function handleRemove(id: string) {
    removeSavedSearch(id);
    setSavedSearches(getSavedSearches());
  }

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<BookmarkBorderIcon />}
        onClick={handleSave}
        sx={{ whiteSpace: "nowrap" }}
      >
        Save Search
      </Button>
      <Button
        variant="text"
        size="small"
        onClick={handleOpenSaved}
        sx={{ minWidth: 44, px: 1 }}
        aria-label="View saved searches"
      >
        <Badge badgeContent={savedSearches.length} color="primary">
          <BookmarkIcon fontSize="small" />
        </Badge>
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {savedSearches.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2">No saved searches yet</Typography>
          </MenuItem>
        ) : (
          savedSearches.map((search) => (
            <MenuItem
              key={search.id}
              onClick={() => handleLoad(search)}
              sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
            >
              <Typography variant="body2">{search.label}</Typography>
              <Button
                size="small"
                color="inherit"
                onClick={(event) => {
                  event.stopPropagation();
                  handleRemove(search.id);
                }}
              >
                Remove
              </Button>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}
