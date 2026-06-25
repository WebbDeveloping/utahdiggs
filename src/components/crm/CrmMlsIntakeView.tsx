"use client";

import { useCallback } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { MlsInputStep, MlsInputField } from "@/lib/mls-input/schema";
import { isFieldVisible } from "@/lib/mls-input/conditions";

type CrmMlsIntakeViewProps = {
  steps: MlsInputStep[];
  data: Record<string, unknown>;
};

function formatValue(field: MlsInputField, value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";

  if (field.type === "fullname" && typeof value === "object") {
    const v = value as { first?: string; last?: string };
    return [v.first, v.last].filter(Boolean).join(" ") || "—";
  }

  if (field.type === "address" && typeof value === "object") {
    const v = value as { street?: string; city?: string; state?: string; zip?: string };
    return [v.street, v.city, v.state, v.zip].filter(Boolean).join(", ") || "—";
  }

  if (field.type === "checkbox" && Array.isArray(value)) {
    return value.join(", ") || "—";
  }

  if (field.type === "matrix" && typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  if (field.type === "file" && Array.isArray(value)) {
    return value.map((f: { name?: string; url?: string }) => f.name || f.url).join(", ");
  }

  if (field.type === "signature" && typeof value === "string") {
    return value ? "Signed (see document)" : "—";
  }

  return String(value);
}

export default function CrmMlsIntakeView({ steps, data }: CrmMlsIntakeViewProps) {
  const copyText = useCallback((text: string) => {
    void navigator.clipboard.writeText(text);
  }, []);

  const remarks =
    (data["q97-publicremarks"] as string | undefined) ||
    (data["q98-commentsto"] as string | undefined) ||
    "";

  return (
    <Stack spacing={3}>
      {remarks ? (
        <Alert
          severity="info"
          action={
            <Button size="small" onClick={() => copyText(remarks)}>
              Copy remarks
            </Button>
          }
        >
          Use copy for quick Matrix data entry.
        </Alert>
      ) : null}

      {steps.map((step) => {
        const visibleFields = step.fields.filter(
          (f) => f.type !== "content" && isFieldVisible(f.id, data),
        );
        if (visibleFields.length === 0) return null;

        return (
          <Paper
            key={step.id}
            elevation={0}
            sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              {step.order}. {step.title}
            </Typography>
            <Stack spacing={1.5}>
              {visibleFields.map((field) => (
                <Box key={field.id}>
                  <Typography variant="caption" color="text.secondary">
                    {field.label ?? field.id}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "pre-wrap", fontFamily: field.type === "matrix" ? "monospace" : undefined }}
                  >
                    {formatValue(field, data[field.id])}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}
