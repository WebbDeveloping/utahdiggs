"use client";

import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { formatAccountDate } from "@/lib/consumer/format-date";
import type { ConsumerShowingRow } from "@/types/consumer-account-data";

type OverviewRecentShowingsProps = {
  showings: ConsumerShowingRow[];
};

export default function OverviewRecentShowings({ showings }: OverviewRecentShowingsProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Recent showings
          </Typography>
          <Button component={NextLink} href="/account/showings" size="small">
            See all
          </Button>
        </Stack>

        {showings.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No showings yet — they’ll show up here as buyers tour the home.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {showings.map((showing) => (
              <Stack key={showing.id} spacing={0.25}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatAccountDate(showing.showingDate)}
                  {showing.showingTime ? ` · ${showing.showingTime}` : ""}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {showing.buyersAgent ?? "Buyer's agent"}
                  {showing.feedback ? ` — ${showing.feedback}` : ""}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
