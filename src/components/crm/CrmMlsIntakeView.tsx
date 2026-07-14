"use client";

import { useCallback, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import {
  formatFieldValue,
  isEmptyFormattedValue,
} from "@/lib/mls-input/format-field-value";
import type { MlsInputField, MlsInputStep } from "@/lib/mls-input/schema";
import { isFieldVisible } from "@/lib/mls-input/conditions";

export type CrmMlsIntakePhoto = {
  id: string;
  name: string;
  url: string;
};

type CrmMlsIntakeViewProps = {
  steps: MlsInputStep[];
  data: Record<string, unknown>;
  listing?: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  photos?: CrmMlsIntakePhoto[];
};

function sectionCopyText(
  fields: MlsInputField[],
  data: Record<string, unknown>,
): string {
  return fields
    .map((field) => {
      const value = formatFieldValue(field, data[field.id]);
      if (isEmptyFormattedValue(value)) return null;
      return `${field.label ?? field.id}: ${value}`;
    })
    .filter(Boolean)
    .join("\n");
}

export default function CrmMlsIntakeView({
  steps,
  data,
  listing,
  photos = [],
}: CrmMlsIntakeViewProps) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const copyText = useCallback(async (text: string, label?: string) => {
    if (!text || isEmptyFormattedValue(text)) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(label ? `Copied ${label}` : "Copied");
      window.setTimeout(() => setCopyStatus(null), 1500);
    } catch {
      setCopyStatus("Copy failed");
      window.setTimeout(() => setCopyStatus(null), 1500);
    }
  }, []);

  const remarks =
    (data["q97-publicremarks"] as string | undefined) ||
    (data["q98-commentsto"] as string | undefined) ||
    "";

  const fullAddress = listing
    ? [listing.address, listing.city, listing.state, listing.zip]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{ p: 2, border: "1px solid", borderColor: "divider" }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ alignItems: { sm: "center" }, flexWrap: "wrap", mb: photos.length ? 2 : 0 }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mr: 1 }}>
            Matrix toolkit
          </Typography>
          {fullAddress ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<ContentCopyOutlinedIcon />}
              onClick={() => void copyText(fullAddress, "address")}
            >
              Copy address
            </Button>
          ) : null}
          {remarks ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<ContentCopyOutlinedIcon />}
              onClick={() => void copyText(remarks, "remarks")}
            >
              Copy remarks
            </Button>
          ) : null}
          {photos.length > 0 ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<OpenInNewOutlinedIcon />}
              onClick={() => {
                for (const photo of photos) {
                  window.open(photo.url, "_blank", "noopener,noreferrer");
                }
              }}
            >
              Open all photos ({photos.length})
            </Button>
          ) : null}
          {copyStatus ? (
            <Typography variant="caption" color="success.main">
              {copyStatus}
            </Typography>
          ) : null}
        </Stack>

        {photos.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 1.5,
            }}
          >
            {photos.map((photo) => (
              <Paper
                key={photo.id}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                }}
              >
                <Box
                  component="img"
                  src={photo.url}
                  alt={photo.name}
                  sx={{
                    display: "block",
                    width: "100%",
                    height: 88,
                    objectFit: "cover",
                    bgcolor: "action.hover",
                  }}
                />
                <Stack
                  direction="row"
                  spacing={0.25}
                  sx={{ justifyContent: "center", py: 0.5 }}
                >
                  <Tooltip title="Open photo">
                    <IconButton
                      size="small"
                      aria-label={`Open ${photo.name}`}
                      href={photo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      component="a"
                    >
                      <OpenInNewOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copy photo URL">
                    <IconButton
                      size="small"
                      aria-label={`Copy URL for ${photo.name}`}
                      onClick={() => void copyText(photo.url, "photo URL")}
                    >
                      <ContentCopyOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Paper>
            ))}
          </Box>
        ) : (
          <Alert severity="info">
            No listing photos yet. Add them on the Summary tab before Matrix entry.
          </Alert>
        )}
      </Paper>

      {steps.map((step) => {
        const visibleFields = step.fields.filter(
          (f) => f.type !== "content" && isFieldVisible(f.id, data),
        );
        if (visibleFields.length === 0) return null;

        const sectionText = sectionCopyText(visibleFields, data);

        return (
          <Paper
            key={step.id}
            elevation={0}
            sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6">
                {step.order}. {step.title}
              </Typography>
              {sectionText ? (
                <Button
                  size="small"
                  startIcon={<ContentCopyOutlinedIcon />}
                  onClick={() => void copyText(sectionText, step.title)}
                >
                  Copy section
                </Button>
              ) : null}
            </Stack>
            <Stack spacing={1.5}>
              {visibleFields.map((field) => {
                const value = formatFieldValue(field, data[field.id]);
                const canCopy = !isEmptyFormattedValue(value);

                return (
                  <Box
                    key={field.id}
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {field.label ?? field.id}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "pre-wrap",
                          fontFamily: field.type === "matrix" ? "monospace" : undefined,
                        }}
                      >
                        {value}
                      </Typography>
                    </Box>
                    {canCopy ? (
                      <Tooltip title="Copy value">
                        <IconButton
                          size="small"
                          aria-label={`Copy ${field.label ?? field.id}`}
                          onClick={() => void copyText(value, field.label ?? field.id)}
                          sx={{ mt: 0.5 }}
                        >
                          <ContentCopyOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}
