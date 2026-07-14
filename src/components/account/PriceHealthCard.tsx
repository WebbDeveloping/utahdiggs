"use client";

import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import {
  formatPriceHealthLabel,
  type PriceHealthResult,
} from "@/lib/consumer/coaching-rules";
import { priceChangeRequestHref } from "@/lib/consumer/price-change-path";

type PriceHealthCardProps = {
  priceHealth: PriceHealthResult;
  listingId: string;
};

function verdictColor(
  verdict: PriceHealthResult["verdict"],
): "success" | "warning" | "error" {
  switch (verdict) {
    case "price_review":
      return "error";
    case "watch":
      return "warning";
    case "on_pace":
      return "success";
  }
}

export default function PriceHealthCard({ priceHealth, listingId }: PriceHealthCardProps) {
  const { verdict, showPriceCta, why } = priceHealth;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: 2,
        borderColor: `${verdictColor(verdict)}.main`,
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
            Price health
          </Typography>
          <Chip
            label={formatPriceHealthLabel(verdict)}
            color={verdictColor(verdict)}
            size="small"
          />
        </Stack>
        <Typography variant="body1">{why}</Typography>
        {showPriceCta ? (
          <Button
            component={NextLink}
            href={priceChangeRequestHref(listingId)}
            variant="contained"
            color="warning"
            sx={{ alignSelf: "flex-start" }}
          >
            Request a price change
          </Button>
        ) : null}
      </Stack>
    </Paper>
  );
}
