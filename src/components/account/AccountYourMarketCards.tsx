import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AccountEmptyState from "@/components/account/AccountEmptyState";
import { formatAccountDate } from "@/lib/consumer/format-date";
import { formatCurrency } from "@/lib/crm/format";
import type { ConsumerMarketDataRow } from "@/types/consumer-account-data";

type AccountYourMarketCardsProps = {
  markets: ConsumerMarketDataRow[];
};

function MarketStat({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600 }}>{value}</Typography>
    </Stack>
  );
}

export default function AccountYourMarketCards({ markets }: AccountYourMarketCardsProps) {
  if (markets.length === 0) {
    return (
      <AccountEmptyState
        title="No market data yet"
        description="Weekly city market stats will appear here for the cities where your listings are located."
        hint="Market data typically updates weekly."
      />
    );
  }

  return (
    <Grid container spacing={3}>
      {markets.map((market) => (
        <Grid key={market.id} size={{ xs: 12, lg: 6 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: "100%" }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "baseline" }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {market.city}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Report {formatAccountDate(market.reportDate)}
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <MarketStat label="Homes for sale" value={String(market.homesForSale ?? "—")} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <MarketStat label="New to market" value={String(market.newToMarket ?? "—")} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <MarketStat label="Homes sold" value={String(market.homesSoldCount ?? "—")} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <MarketStat label="Avg days on market" value={String(market.avgDom ?? "—")} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <MarketStat label="Avg home price" value={formatCurrency(market.avgHomePrice)} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <MarketStat label="Avg sold price" value={formatCurrency(market.avgSoldPrice)} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <MarketStat label="Price per sq ft" value={formatCurrency(market.pricePerSqFt)} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <MarketStat
                    label="Price reductions"
                    value={String(market.priceReductionsCount ?? "—")}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <MarketStat
                    label="Sold-to-listed ratio"
                    value={market.soldToListedRatio ?? "—"}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
