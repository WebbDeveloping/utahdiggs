"use client";

import { FormEvent, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

const TIMELINE_OPTIONS = ["0-30 Days", "31-120 Days", "120+ Days"] as const;

type Timeline = (typeof TIMELINE_OPTIONS)[number];

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  timeline: Timeline | "";
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const emptyForm = (initialAddress = ""): FormValues => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  streetAddress: initialAddress,
  city: "",
  state: "Utah",
  zip: "",
  timeline: "",
});

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    backgroundColor: "background.default",
  },
};

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.firstName.trim()) errors.firstName = "First name is required";
  if (!values.lastName.trim()) errors.lastName = "Last name is required";

  const email = values.email.trim();
  if (!email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address";
  }

  if (!values.phone.trim()) errors.phone = "Phone is required";

  if (!values.streetAddress.trim()) errors.streetAddress = "Street address is required";
  if (!values.city.trim()) errors.city = "City is required";
  if (!values.state) errors.state = "State is required";

  const zip = values.zip.trim();
  if (!zip) {
    errors.zip = "Zip code is required";
  } else if (!/^\d{5}$/.test(zip)) {
    errors.zip = "Enter a valid 5-digit zip code";
  }

  if (!values.timeline) errors.timeline = "Please select a timeline";

  return errors;
}

type SellInquiryFormProps = {
  initialAddress?: string;
};

export default function SellInquiryForm({ initialAddress = "" }: SellInquiryFormProps) {
  const [values, setValues] = useState<FormValues>(() => emptyForm(initialAddress));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Alert severity="success" sx={{ borderRadius: 3 }}>
        Thanks! An agent will be in touch soon.
      </Alert>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{
        backgroundColor: "background.paper",
        borderRadius: 4,
        boxShadow: "0 4px 24px rgba(19, 33, 28, 0.08)",
        border: "1px solid",
        borderColor: "divider",
        p: { xs: 2.5, sm: 3.5 },
      }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="First Name"
            required
            value={values.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            error={Boolean(errors.firstName)}
            helperText={errors.firstName ?? " "}
            autoComplete="given-name"
            slotProps={{ formHelperText: { sx: { mx: 0, minHeight: 20 } } }}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Last Name"
            required
            value={values.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            error={Boolean(errors.lastName)}
            helperText={errors.lastName ?? " "}
            autoComplete="family-name"
            slotProps={{ formHelperText: { sx: { mx: 0, minHeight: 20 } } }}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Email Address"
            required
            type="email"
            value={values.email}
            onChange={(e) => updateField("email", e.target.value)}
            error={Boolean(errors.email)}
            helperText={errors.email ?? " "}
            autoComplete="email"
            slotProps={{ formHelperText: { sx: { mx: 0, minHeight: 20 } } }}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Phone"
            required
            type="tel"
            value={values.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            error={Boolean(errors.phone)}
            helperText={errors.phone ?? " "}
            autoComplete="tel"
            slotProps={{ formHelperText: { sx: { mx: 0, minHeight: 20 } } }}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Street Address"
            required
            value={values.streetAddress}
            onChange={(e) => updateField("streetAddress", e.target.value)}
            error={Boolean(errors.streetAddress)}
            helperText={errors.streetAddress ?? " "}
            autoComplete="street-address"
            slotProps={{ formHelperText: { sx: { mx: 0, minHeight: 20 } } }}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="City"
            required
            value={values.city}
            onChange={(e) => updateField("city", e.target.value)}
            error={Boolean(errors.city)}
            helperText={errors.city ?? " "}
            autoComplete="address-level2"
            slotProps={{ formHelperText: { sx: { mx: 0, minHeight: 20 } } }}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth required error={Boolean(errors.state)}>
            <InputLabel id="sell-inquiry-state-label">State</InputLabel>
            <Select
              labelId="sell-inquiry-state-label"
              label="State"
              value={values.state}
              onChange={(e) => updateField("state", e.target.value)}
              sx={{
                borderRadius: 3,
                backgroundColor: "background.default",
              }}
            >
              <MenuItem value="Utah">Utah</MenuItem>
            </Select>
            <FormHelperText sx={{ mx: 0, minHeight: 20 }}>
              {errors.state ?? " "}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Zip Code"
            required
            value={values.zip}
            onChange={(e) => updateField("zip", e.target.value)}
            error={Boolean(errors.zip)}
            helperText={errors.zip ?? " "}
            autoComplete="postal-code"
            inputMode="numeric"
            slotProps={{ formHelperText: { sx: { mx: 0, minHeight: 20 } } }}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth required error={Boolean(errors.timeline)}>
            <InputLabel id="sell-inquiry-timeline-label">How soon do you want to sell?</InputLabel>
            <Select
              labelId="sell-inquiry-timeline-label"
              label="How soon do you want to sell?"
              value={values.timeline}
              onChange={(e) => updateField("timeline", e.target.value as Timeline)}
              displayEmpty
              sx={{
                borderRadius: 3,
                backgroundColor: "background.default",
              }}
            >
              <MenuItem value="" disabled>
                Select a timeline
              </MenuItem>
              {TIMELINE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText sx={{ mx: 0, minHeight: 20 }}>
              {errors.timeline ?? " "}
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: 13, lineHeight: 1.6 }}>
        By providing a telephone number and submitting the form, you are consenting to be
        contacted by Glide RE by call, email and text. Message &amp; data rates may apply.
        Reply STOP to opt out.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: 13 }}>
        <Link href="#" underline="hover" color="primary" sx={{ fontWeight: 600 }}>
          Privacy Policy
        </Link>
        {" | "}
        <Link href="#" underline="hover" color="primary" sx={{ fontWeight: 600 }}>
          Terms &amp; Conditions
        </Link>
        .
      </Typography>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        sx={{ mt: 3, width: { xs: "100%", sm: "auto" }, minWidth: 160 }}
      >
        Submit
      </Button>
    </Box>
  );
}
