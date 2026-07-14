"use client";

import { BarChart } from "@mui/x-charts/BarChart";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import type { PortalBreakdownChartData } from "@/lib/consumer/web-traffic-chart-data";

type PortalBreakdownChartProps = {
  data: PortalBreakdownChartData;
};

export default function PortalBreakdownChart({ data }: PortalBreakdownChartProps) {
  const theme = useTheme();
  const portals = data.items.map((item) => item.portal);
  const views = data.items.map((item) => item.views);
  const chartHeight = Math.max(160, data.items.length * 36 + 24);

  if (data.items.length === 0) return null;

  return (
    <Stack spacing={1}>
      <Stack spacing={0.25}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Views by portal
        </Typography>
        <Typography variant="caption" color="text.secondary">
          30-day views by listing portal for the latest week.
        </Typography>
      </Stack>
      <Stack sx={{ width: "100%", height: chartHeight }}>
        <BarChart
          layout="horizontal"
          yAxis={[
            {
              data: portals,
              scaleType: "band",
              width: 100,
              tickLabelStyle: { fontSize: 12, fill: theme.palette.text.secondary },
            },
          ]}
          xAxis={[
            {
              min: 0,
              tickLabelStyle: { fontSize: 12, fill: theme.palette.text.secondary },
            },
          ]}
          series={[
            {
              data: views,
              label: "Views (30-day)",
              color: theme.palette.primary.main,
              valueFormatter: (value: number | null) =>
                value == null ? "—" : value.toLocaleString("en-US"),
            },
          ]}
          margin={{ top: 8, right: 24, bottom: 24, left: 8 }}
          grid={{ vertical: true }}
          hideLegend
          sx={{
            width: "100%",
            height: "100%",
            "& .MuiChartsAxis-line": { stroke: theme.palette.divider },
            "& .MuiChartsAxis-tick": { stroke: theme.palette.divider },
            "& .MuiChartsGrid-line": { stroke: theme.palette.divider },
          }}
        />
      </Stack>
    </Stack>
  );
}
