"use client";

import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme } from "@mui/material/styles";
import AccountChartCard from "@/components/account/charts/AccountChartCard";
import type { ShowingsWeekChartData } from "@/lib/consumer/showings-chart-data";

const SERIES_PALETTE = ["#0e7a5f", "#2a6f97", "#b4452f", "#6b5b4f", "#5d6b64"];

type WeeklyShowingsChartProps = {
  data: ShowingsWeekChartData;
};

export default function WeeklyShowingsChart({ data }: WeeklyShowingsChartProps) {
  const theme = useTheme();
  const multi = data.series.length > 1;

  return (
    <AccountChartCard
      title="Showings by week"
      caption="Scheduled showings over the last 8 weeks."
      isEmpty={data.weekLabels.length === 0}
    >
      <BarChart
        xAxis={[
          {
            data: data.weekLabels,
            scaleType: "band",
            tickLabelStyle: { fontSize: 12, fill: theme.palette.text.secondary },
          },
        ]}
        yAxis={[
          {
            min: 0,
            tickMinStep: 1,
            tickLabelStyle: { fontSize: 12, fill: theme.palette.text.secondary },
          },
        ]}
        series={data.series.map((series, index) => ({
          id: series.listingId,
          data: series.data,
          label: multi ? series.listingLabel : "Showings",
          color: SERIES_PALETTE[index % SERIES_PALETTE.length],
          valueFormatter: (value: number | null) =>
            value == null ? "—" : value.toLocaleString("en-US"),
        }))}
        margin={{ top: 20, right: 16, bottom: 30, left: 40 }}
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
