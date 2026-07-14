"use client";

import { LineChart } from "@mui/x-charts/LineChart";
import { useTheme } from "@mui/material/styles";
import AccountChartCard from "@/components/account/charts/AccountChartCard";
import type { ViewsTrendChartData } from "@/lib/consumer/web-traffic-chart-data";

const SERIES_PALETTE = ["#0e7a5f", "#2a6f97", "#b4452f", "#6b5b4f", "#5d6b64"];

type WeeklyViewsChartProps = {
  data: ViewsTrendChartData;
};

export default function WeeklyViewsChart({ data }: WeeklyViewsChartProps) {
  const theme = useTheme();
  const isWeeklyNew = data.mode === "weekly_new";
  const multi = data.series.length > 1;

  return (
    <AccountChartCard
      title={isWeeklyNew ? "New views by week" : "Views (30-day)"}
      caption={
        isWeeklyNew
          ? "New listing views each week over the last 8 weeks."
          : "Rolling 30-day portal view totals at each week ending (last 8 weeks)."
      }
      isEmpty={data.weekLabels.length === 0}
    >
      <LineChart
        xAxis={[
          {
            data: data.weekLabels,
            scaleType: "point",
            tickLabelStyle: { fontSize: 12, fill: theme.palette.text.secondary },
          },
        ]}
        yAxis={[
          {
            min: 0,
            tickLabelStyle: { fontSize: 12, fill: theme.palette.text.secondary },
          },
        ]}
        series={data.series.map((series, index) => ({
          id: series.listingId,
          data: series.data,
          label: multi ? series.listingLabel : isWeeklyNew ? "New views" : "Views (30-day)",
          color: SERIES_PALETTE[index % SERIES_PALETTE.length],
          showMark: data.weekLabels.length <= 8,
          connectNulls: false,
          valueFormatter: (value: number | null) =>
            value == null ? "—" : value.toLocaleString("en-US"),
        }))}
        margin={{ top: 20, right: 16, bottom: 30, left: 48 }}
        grid={{ horizontal: true }}
        hideLegend={!multi}
        sx={{
          width: "100%",
          height: "100%",
          "& .MuiChartsAxis-line": { stroke: theme.palette.divider },
          "& .MuiChartsAxis-tick": { stroke: theme.palette.divider },
          "& .MuiChartsGrid-line": { stroke: theme.palette.divider },
        }}
      />
    </AccountChartCard>
  );
}
