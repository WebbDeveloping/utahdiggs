"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import type { AirtableSyncResult } from "@/lib/airtable-sync/sync";

type SyncResponse = {
  ok: boolean;
  result?: AirtableSyncResult;
  error?: string;
};

function formatSuccess(result: AirtableSyncResult): string {
  const { weeklyStats, marketData } = result;
  return (
    `Weekly stats: ${weeklyStats.synced} synced, ${weeklyStats.skipped} skipped` +
    ` · Market data: ${marketData.synced} synced, ${marketData.skipped} skipped`
  );
}

export default function AirtableSyncButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSync() {
    setPending(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/crm/sync-airtable", { method: "POST" });
      const data = (await response.json()) as SyncResponse;

      if (!response.ok || !data.ok || !data.result) {
        setError(data.error ?? "Sync failed");
        return;
      }

      setSuccess(formatSuccess(data.result));
    } catch {
      setError("Network error — could not start sync");
    } finally {
      setPending(false);
    }
  }

  return (
    <Stack spacing={1} sx={{ alignItems: { sm: "flex-end" }, maxWidth: 420 }}>
      <Button
        variant="outlined"
        startIcon={
          pending ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <SyncOutlinedIcon />
          )
        }
        onClick={handleSync}
        disabled={pending}
      >
        {pending ? "Syncing…" : "Sync from Airtable"}
      </Button>
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: { sm: "right" } }}>
        Pulls weekly stats and market data. May take a few minutes.
      </Typography>
      {error ? (
        <Alert severity="error" onClose={() => setError(null)} sx={{ width: "100%" }}>
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ width: "100%" }}>
          {success}
        </Alert>
      ) : null}
    </Stack>
  );
}
