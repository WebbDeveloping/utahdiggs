"use client";

import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { SearchFilters } from "@/types/public-listing";

type AdvancedFiltersDialogProps = {
  open: boolean;
  filters: SearchFilters;
  onClose: () => void;
  onApply: (filters: Partial<SearchFilters>) => void;
  onReset: () => void;
};

export default function AdvancedFiltersDialog({
  open,
  filters,
  onClose,
  onApply,
  onReset,
}: AdvancedFiltersDialogProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    if (open) setLocalFilters(filters);
  }, [filters, open]);

  function updateField(key: keyof SearchFilters, value: string | undefined) {
    setLocalFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        More Filters
        <Button aria-label="Close filters" onClick={onClose} sx={{ minWidth: 0, p: 0.5 }}>
          <CloseIcon />
        </Button>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <TextField
            label="Zip Code"
            value={localFilters.zip ?? ""}
            onChange={(event) => updateField("zip", event.target.value || undefined)}
            slotProps={{ htmlInput: { maxLength: 5 } }}
            fullWidth
          />
          <TextField
            select
            label="State"
            value={localFilters.state ?? ""}
            onChange={(event) => updateField("state", event.target.value || undefined)}
            fullWidth
          >
            <MenuItem value="">All States</MenuItem>
            <MenuItem value="UT">Utah</MenuItem>
          </TextField>
          <TextField
            label="Neighborhood"
            value={localFilters.neighborhood ?? ""}
            onChange={(event) => updateField("neighborhood", event.target.value || undefined)}
            fullWidth
          />
          <TextField
            label="Subdivision"
            value={localFilters.subdivision ?? ""}
            onChange={(event) => updateField("subdivision", event.target.value || undefined)}
            fullWidth
          />
          <TextField
            label="Keyword"
            value={localFilters.keyword ?? ""}
            onChange={(event) => updateField("keyword", event.target.value || undefined)}
            fullWidth
          />
          <TextField
            label="MLS #"
            value={localFilters.mlsNumber ?? ""}
            onChange={(event) => updateField("mlsNumber", event.target.value || undefined)}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={localFilters.hasPool === "true"}
                onChange={(event) =>
                  updateField("hasPool", event.target.checked ? "true" : undefined)
                }
              />
            }
            label="Pool"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, py: 2 }}>
        <Button color="inherit" onClick={onReset}>
          Reset Filters
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              onApply({
                zip: localFilters.zip,
                state: localFilters.state,
                neighborhood: localFilters.neighborhood,
                subdivision: localFilters.subdivision,
                keyword: localFilters.keyword,
                mlsNumber: localFilters.mlsNumber,
                hasPool: localFilters.hasPool,
              });
              onClose();
            }}
          >
            Apply
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
