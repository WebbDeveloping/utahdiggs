"use client";

import { useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { MlsInputStep, MlsInputField } from "@/lib/mls-input/schema";
import { isFieldVisible } from "@/lib/mls-input/conditions";

type CrmMlsIntakePrintViewProps = {
  steps: MlsInputStep[];
  data: Record<string, unknown>;
  listing: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
};

function formatPrintValue(field: MlsInputField, value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  if (field.type === "fullname" && typeof value === "object") {
    const v = value as { first?: string; last?: string };
    return [v.first, v.last].filter(Boolean).join(" ");
  }
  if (field.type === "address" && typeof value === "object") {
    const v = value as { street?: string; city?: string; state?: string; zip?: string };
    return [v.street, v.city, v.state, v.zip].filter(Boolean).join(", ");
  }
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function CrmMlsIntakePrintView({
  steps,
  data,
  listing,
}: CrmMlsIntakePrintViewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Stack spacing={2}>
      <Button variant="outlined" onClick={handlePrint} sx={{ alignSelf: "flex-start" }}>
        Print / export
      </Button>
      <Box
        ref={printRef}
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          "@media print": { border: "none", p: 0 },
        }}
      >
        <Typography variant="h5" sx={{ mb: 1 }}>
          MLS Intake — WFRMLS Form B Reference
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          {listing.address}, {listing.city}, {listing.state} {listing.zip}
        </Typography>

        {steps.map((step) => {
          const fields = step.fields.filter(
            (f) => f.type !== "content" && isFieldVisible(f.id, data),
          );
          if (!fields.length) return null;

          return (
            <Box key={step.id} sx={{ mb: 3, breakInside: "avoid" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                {step.title}
              </Typography>
              {fields.map((field) => {
                const text = formatPrintValue(field, data[field.id]);
                if (!text) return null;
                return (
                  <Box key={field.id} sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {field.label ?? field.id}
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {text}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
}
