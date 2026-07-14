"use client";

import type { ReactNode } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type AccountChartCardProps = {
  title: string;
  caption?: string;
  height?: number;
  children: ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
};

export default function AccountChartCard({
  title,
  caption,
  height = 260,
  children,
  emptyMessage = "Not enough data to chart yet.",
  isEmpty = false,
}: AccountChartCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {caption ? (
            <Typography variant="body2" color="text.secondary">
              {caption}
            </Typography>
          ) : null}
        </Stack>
        {isEmpty ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            {emptyMessage}
          </Typography>
        ) : (
          <Stack sx={{ width: "100%", height, minHeight: height }}>{children}</Stack>
        )}
      </Stack>
    </Paper>
  );
}
