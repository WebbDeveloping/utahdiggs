"use client";

import { useCallback } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatFieldValue } from "@/lib/mls-input/format-field-value";
import type { MlsInputStep } from "@/lib/mls-input/schema";
import { isFieldVisible } from "@/lib/mls-input/conditions";

type CrmMlsIntakeViewProps = {
  steps: MlsInputStep[];
  data: Record<string, unknown>;
};

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
                    {formatFieldValue(field, data[field.id])}
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
