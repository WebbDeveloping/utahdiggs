"use client";

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

export default function MlsInputStepView({
  step,
  values,
  fieldErrors = {},
  onChange,
}: MlsInputStepViewProps) {
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
            <FieldRenderer
              key={field.id}
              field={field}
              value={values[field.id]}
              error={fieldErrors[field.id]}
              allValues={values}
              onChange={onChange}
            />
          );
        }
        return null;
      })}
    </Stack>
  );
}
