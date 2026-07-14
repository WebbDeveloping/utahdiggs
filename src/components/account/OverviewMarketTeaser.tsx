"use client";

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { formatAccountNumber } from "@/lib/consumer/format-date";
import { formatCurrency } from "@/lib/crm/format";
import type { ConsumerMarketDataRow } from "@/types/consumer-account-data";

type OverviewMarketTeaserProps = {
  market: ConsumerMarketDataRow | null;
  city: string | null;
};

function TeaserStat({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Stack>
  );
}

export default function OverviewMarketTeaser({ market, city }: OverviewMarketTeaserProps) {
  const titleCity = market?.city ?? city ?? "Your";

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {titleCity} market
          </Typography>
          <Button component={NextLink} href="/account/your-market" size="small">
            Full market
          </Button>
        </Stack>

        {!market ? (
          <Typography variant="body2" color="text.secondary">
            City market numbers aren’t available yet.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            <Grid size={{ xs: 4 }}>
              <TeaserStat
                label="Avg DOM"
                value={
                  market.avgDom != null ? formatAccountNumber(market.avgDom) : "—"
                }
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TeaserStat
                label="Avg sold"
                value={formatCurrency(market.avgSoldPrice)}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TeaserStat
                label="Homes for sale"
                value={
                  market.homesForSale != null
                    ? formatAccountNumber(market.homesForSale)
                    : "—"
                }
              />
            </Grid>
          </Grid>
        )}
      </Stack>
    </Paper>
  );
}
