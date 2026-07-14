"use client";

import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { formatAccountDate } from "@/lib/consumer/format-date";
import { formatOfferVsList } from "@/lib/consumer/listing-stats";
import { formatCurrency } from "@/lib/crm/format";
import type { ConsumerOfferRow } from "@/types/consumer-account-data";

type OverviewPendingOfferHighlightProps = {
  offer: ConsumerOfferRow;
};

export default function OverviewPendingOfferHighlight({
  offer,
}: OverviewPendingOfferHighlightProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2,
        borderColor: "warning.main",
        borderLeft: 4,
      }}
    >
      <Stack spacing={1.5}>
        <Chip
          label="Pending review"
          color="warning"
          size="small"
          sx={{ alignSelf: "flex-start" }}
        />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {formatCurrency(offer.offerPrice)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {offer.buyersAgent ?? "Buyer's agent"} · {formatAccountDate(offer.submittedDate)} ·{" "}
          {formatOfferVsList(offer.offerPrice, offer.listPrice)} vs list
        </Typography>
        <Button
          component={NextLink}
          href="/account/offers"
          variant="outlined"
          size="small"
          sx={{ alignSelf: "flex-start" }}
        >
          View all offers
        </Button>
      </Stack>
    </Paper>
  );
}
