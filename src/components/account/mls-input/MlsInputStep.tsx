"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { MlsInputStep } from "@/lib/mls-input/schema";
import { isFieldVisible } from "@/lib/mls-input/conditions";
import FieldRenderer from "./fields/FieldRenderer";

type MlsInputStepViewProps = {
  step: MlsInputStep;
  values: Record<string, unknown>;
  fieldErrors?: Record<string, string>;
  onChange: (fieldId: string, value: unknown) => void;
};

function formatListingAddressOnFile(values: Record<string, unknown>): string | null {
  const addr = values.listingAddress as
    | { street?: string; city?: string; state?: string; zip?: string }
    | undefined;
  if (!addr) return null;
  const line = [addr.street, addr.city, addr.state, addr.zip]
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter(Boolean)
    .join(", ");
  return line || null;
}

export default function MlsInputStepView({
  step,
  values,
  fieldErrors = {},
  onChange,
}: MlsInputStepViewProps) {
  const listingAddressOnFile = formatListingAddressOnFile(values);

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h6">{step.title}</Typography>
        {step.intro ? (
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
            {step.intro}
          </Typography>
        ) : null}
      </Stack>

      {step.fields.map((field) => {
        if (field.type === "content" || isFieldVisible(field.id, values)) {
          return (
            <Box key={field.id} id={`mls-field-${field.id}`}>
              {field.id === "ownerAddressSameAsListing" && listingAddressOnFile ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Listing address on file: <strong>{listingAddressOnFile}</strong>
                </Alert>
              ) : null}
              <FieldRenderer
                field={field}
                value={values[field.id]}
                error={fieldErrors[field.id]}
                allValues={values}
                onChange={onChange}
              />
            </Box>
          );
        }
        return null;
      })}
    </Stack>
  );
}
