"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PhoneTextField from "@/components/ui/PhoneTextField";
import type { MlsInputField } from "@/lib/mls-input/schema";
import FileField from "./FileField";
import MatrixField from "./MatrixField";
import SignatureField from "./SignatureField";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "background.default",
  },
};

type FieldRendererProps = {
  field: MlsInputField;
  value: unknown;
  error?: string;
  allValues: Record<string, unknown>;
  onChange: (fieldId: string, value: unknown) => void;
};

function ContentField({ field }: { field: MlsInputField }) {
  const text = field.content ?? "";
  return (
    <Alert severity="info" sx={{ whiteSpace: "pre-wrap" }}>
      {text.split("\n").map((line, i) => (
        <Typography key={i} variant="body2" component="div" sx={{ mb: line ? 0.5 : 0 }}>
          {line || "\u00A0"}
        </Typography>
      ))}
    </Alert>
  );
}

export default function FieldRenderer({
  field,
  value,
  error,
  allValues,
  onChange,
}: FieldRendererProps) {
  const [otherText, setOtherText] = useState("");

  if (field.type === "content") {
    return <ContentField field={field} />;
  }

  const label = field.label ?? field.id;
  const helper = field.description;

  if (field.type === "fullname") {
    const nameVal = (value as { first?: string; last?: string }) ?? {};
    return (
      <Stack spacing={2}>
        <Typography variant="subtitle2">
          {label}
          {field.required ? " *" : ""}
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="First name"
            required={field.required}
            value={nameVal.first ?? ""}
            onChange={(e) =>
              onChange(field.id, { ...nameVal, first: e.target.value })
            }
            error={!!error}
            sx={{ ...inputSx, flex: 1 }}
          />
          <TextField
            label="Last name"
            required={field.required}
            value={nameVal.last ?? ""}
            onChange={(e) =>
              onChange(field.id, { ...nameVal, last: e.target.value })
            }
            error={!!error}
            sx={{ ...inputSx, flex: 1 }}
          />
        </Stack>
        {error ? <FormHelperText error>{error}</FormHelperText> : null}
      </Stack>
    );
  }

  if (field.type === "address") {
    const addr = (value as {
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
    }) ?? {};
    return (
      <Stack spacing={2}>
        <Typography variant="subtitle2">
          {label}
          {field.required ? " *" : ""}
        </Typography>
        {helper ? (
          <Typography variant="body2" color="text.secondary">
            {helper}
          </Typography>
        ) : null}
        <TextField
          label="Street address"
          required={field.required}
          value={addr.street ?? ""}
          onChange={(e) => onChange(field.id, { ...addr, street: e.target.value })}
          error={!!error}
          sx={inputSx}
        />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="City"
            required={field.required}
            value={addr.city ?? ""}
            onChange={(e) => onChange(field.id, { ...addr, city: e.target.value })}
            sx={{ ...inputSx, flex: 2 }}
          />
          <TextField
            label="State"
            required={field.required}
            value={addr.state ?? ""}
            onChange={(e) => onChange(field.id, { ...addr, state: e.target.value })}
            sx={{ ...inputSx, flex: 1 }}
          />
          <TextField
            label="ZIP"
            required={field.required}
            value={addr.zip ?? ""}
            onChange={(e) => onChange(field.id, { ...addr, zip: e.target.value })}
            sx={{ ...inputSx, flex: 1 }}
          />
        </Stack>
        {error ? <FormHelperText error>{error}</FormHelperText> : null}
      </Stack>
    );
  }

  if (field.type === "phone") {
    return (
      <PhoneTextField
        label={label}
        required={field.required}
        value={(value as string) ?? ""}
        onChange={(v) => onChange(field.id, v)}
        error={!!error}
        helperText={error ?? helper}
        placeholder={field.placeholder}
        sx={inputSx}
      />
    );
  }

  if (field.type === "matrix") {
    return (
      <MatrixField
        field={field}
        value={value as Record<string, Record<string, string | string[]>>}
        error={error}
        allValues={allValues}
        onChange={(v) => onChange(field.id, v)}
      />
    );
  }

  if (field.type === "file") {
    return (
      <FileField
        label={label}
        value={value as Array<{ name: string; url: string }>}
        error={error}
        multiple={field.multiple !== false}
        onChange={(v) => onChange(field.id, v)}
      />
    );
  }

  if (field.type === "signature") {
    return (
      <SignatureField
        label={label}
        value={(value as string) ?? ""}
        required={field.required}
        error={error}
        onChange={(url) => onChange(field.id, url)}
      />
    );
  }

  if (field.type === "radio" || field.type === "select") {
    const options = field.options ?? [];
    const stringVal = (value as string) ?? "";

    if (field.type === "select") {
      return (
        <TextField
          select
          label={label}
          required={field.required}
          value={stringVal}
          onChange={(e) => onChange(field.id, e.target.value)}
          error={!!error}
          helperText={error ?? helper}
          placeholder={field.placeholder}
          sx={inputSx}
          fullWidth
        >
          <MenuItem value="">Select…</MenuItem>
          {options.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    return (
      <FormControl error={!!error} component="fieldset">
        <FormLabel component="legend">
          {label}
          {field.required ? " *" : ""}
        </FormLabel>
        {helper ? <FormHelperText sx={{ mx: 0 }}>{helper}</FormHelperText> : null}
        <RadioGroup
          value={stringVal}
          onChange={(e) => onChange(field.id, e.target.value)}
        >
          {options.map((opt) => (
            <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
          ))}
          {field.otherText ? (
            <Box sx={{ pl: 4, pt: 1 }}>
              <TextField
                size="small"
                label="Other (please specify)"
                value={otherText}
                onChange={(e) => {
                  setOtherText(e.target.value);
                  onChange(field.id, e.target.value ? `Other: ${e.target.value}` : "Other");
                }}
                sx={inputSx}
              />
            </Box>
          ) : null}
        </RadioGroup>
        {error ? <FormHelperText>{error}</FormHelperText> : null}
      </FormControl>
    );
  }

  if (field.type === "checkbox") {
    const selected = Array.isArray(value) ? (value as string[]) : [];
    const options = field.options ?? [];

    const toggle = (opt: string, checked: boolean) => {
      if (checked) {
        onChange(field.id, [...selected, opt]);
      } else {
        onChange(field.id, selected.filter((s) => s !== opt));
      }
    };

    return (
      <FormControl error={!!error} component="fieldset">
        <FormLabel component="legend">
          {label}
          {field.required ? " *" : ""}
        </FormLabel>
        {helper ? <FormHelperText sx={{ mx: 0 }}>{helper}</FormHelperText> : null}
        <FormGroup>
          {options.map((opt) => (
            <FormControlLabel
              key={opt}
              control={
                <Checkbox
                  checked={selected.includes(opt)}
                  onChange={(e) => toggle(opt, e.target.checked)}
                />
              }
              label={opt}
            />
          ))}
          {field.otherText ? (
            <Stack direction="row" spacing={1} sx={{ pl: 1, alignItems: "center" }}>
              <Checkbox
                checked={selected.some((s) => s.startsWith("Other"))}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange(field.id, [...selected.filter((s) => !s.startsWith("Other")), "Other"]);
                  } else {
                    onChange(field.id, selected.filter((s) => !s.startsWith("Other")));
                    setOtherText("");
                  }
                }}
              />
              <TextField
                size="small"
                label="Other"
                value={otherText}
                onChange={(e) => {
                  setOtherText(e.target.value);
                  const without = selected.filter((s) => !s.startsWith("Other"));
                  if (e.target.value) {
                    onChange(field.id, [...without, `Other: ${e.target.value}`]);
                  } else {
                    onChange(field.id, [...without, "Other"]);
                  }
                }}
                sx={inputSx}
              />
            </Stack>
          ) : null}
        </FormGroup>
        {error ? <FormHelperText>{error}</FormHelperText> : null}
      </FormControl>
    );
  }

  const isMultiline = field.type === "textarea";
  const inputType =
    field.type === "email"
      ? "email"
      : field.type === "number"
        ? "number"
        : field.type === "currency"
          ? "text"
          : "text";

  return (
    <TextField
      label={label}
      required={field.required}
      type={inputType}
      value={(value as string) ?? ""}
      onChange={(e) => onChange(field.id, e.target.value)}
      error={!!error}
      helperText={error ?? helper}
      placeholder={field.placeholder}
      multiline={isMultiline}
      minRows={isMultiline ? 4 : undefined}
      fullWidth
      sx={inputSx}
    />
  );
}
