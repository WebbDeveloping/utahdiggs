"use client";

import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { mlsDataFormPreviewStorageKey } from "@/lib/mls-input/data-form-preview-storage";

type DataFormPreviewViewerProps = {
  listingId: string;
};

export default function DataFormPreviewViewer({ listingId }: DataFormPreviewViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function loadPreview() {
      setLoading(true);
      setError(null);

      const storageKey = mlsDataFormPreviewStorageKey(listingId);
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) {
        if (!cancelled) {
          setError(
            "Preview data was not found. Go back to the MLS form signature step and click View official form again.",
          );
          setLoading(false);
        }
        return;
      }

      let values: Record<string, unknown>;
      try {
        values = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        if (!cancelled) {
          setError("Could not read preview data. Return to the MLS form and try again.");
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`/api/account/listings/${listingId}/data-form/preview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ values }),
        });

        if (!response.ok) {
          let message = "Could not generate preview.";
          try {
            const payload = (await response.json()) as { error?: string };
            if (payload.error) message = payload.error;
          } catch {
            // keep default message
          }
          if (!cancelled) {
            setError(message);
            setLoading(false);
          }
          return;
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setPdfUrl(objectUrl);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("Could not generate preview. Check your connection and try again.");
          setLoading(false);
        }
      }
    }

    void loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [listingId]);

  if (loading) {
    return (
      <Stack spacing={2} sx={{ py: 8, alignItems: "center" }}>
        <CircularProgress size={32} />
        <Typography color="text.secondary">Generating your Data Form preview…</Typography>
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!pdfUrl) {
    return <Alert severity="warning">Preview is unavailable.</Alert>;
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "grey.100",
      }}
    >
      <Box
        component="iframe"
        src={pdfUrl}
        title="UAR Data Form preview"
        sx={{
          display: "block",
          width: "100%",
          height: { xs: "70vh", md: "82vh" },
          border: 0,
          bgcolor: "white",
        }}
      />
    </Paper>
  );
}
