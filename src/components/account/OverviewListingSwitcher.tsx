"use client";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useRouter } from "next/navigation";

type OverviewListingSwitcherProps = {
  listings: { id: string; address: string; city: string }[];
  selectedListingId: string;
};

export default function OverviewListingSwitcher({
  listings,
  selectedListingId,
}: OverviewListingSwitcherProps) {
  const router = useRouter();

  if (listings.length <= 1) return null;

  function handleChange(event: SelectChangeEvent) {
    const id = event.target.value;
    router.push(id ? `/account?listing=${encodeURIComponent(id)}` : "/account");
  }

  return (
    <FormControl size="small" sx={{ minWidth: 260, maxWidth: "100%" }}>
      <InputLabel id="overview-listing-label">Listing</InputLabel>
      <Select
        labelId="overview-listing-label"
        label="Listing"
        value={selectedListingId}
        onChange={handleChange}
      >
        {listings.map((listing) => (
          <MenuItem key={listing.id} value={listing.id}>
            {listing.address}, {listing.city}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
