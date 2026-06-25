"use client";

import { FormEvent, useActionState, useState, useTransition } from "react";
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
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  checkSellInquiryEmailAction,
  completeLoggedInSellInquiryAction,
  completeSellInquiryAction,
  type SellInquiryState,
} from "@/lib/consumer/sell-inquiry-actions";
import { TIMELINE_OPTIONS } from "@/lib/consumer/sell-inquiry-validation";

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

type FormErrors = Partial<Record<keyof FormValues | "password" | "confirmPassword", string>>;

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

function validateStepOne(values: FormValues): FormErrors {
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
  isLoggedIn?: boolean;
};

export default function SellInquiryForm({
  initialAddress = "",
  isLoggedIn = false,
}: SellInquiryFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<FormValues>(() => emptyForm(initialAddress));
  const [errors, setErrors] = useState<FormErrors>({});
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, startEmailCheck] = useTransition();

  const authAction = isLoggedIn ? completeLoggedInSellInquiryAction : completeSellInquiryAction;
  const [state, formAction, pending] = useActionState<SellInquiryState, FormData>(
    authAction,
    {},
  );

  const mergedErrors: FormErrors = {
    ...errors,
    ...state.fieldErrors,
  };

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

  function appendInquiryFields(formData: FormData) {
    formData.set("firstName", values.firstName.trim());
    formData.set("lastName", values.lastName.trim());
    formData.set("email", values.email.trim().toLowerCase());
    formData.set("phone", values.phone.trim());
    formData.set("streetAddress", values.streetAddress.trim());
    formData.set("city", values.city.trim());
    formData.set("state", values.state);
    formData.set("zip", values.zip.trim());
    formData.set("timeline", values.timeline);
  }

  function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateStepOne(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    if (isLoggedIn) {
      const formData = new FormData();
      appendInquiryFields(formData);
      formAction(formData);
      return;
    }

    startEmailCheck(async () => {
      const result = await checkSellInquiryEmailAction(values.email);
      setEmailExists(result.exists);
      setStep(2);
    });
  }

  function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    appendInquiryFields(formData);
    formData.set("emailExists", String(emailExists));
    formAction(formData);
  }

  const formShellSx = {
    backgroundColor: "background.paper",
    borderRadius: 4,
    boxShadow: "0 4px 24px rgba(19, 33, 28, 0.08)",
    border: "1px solid",
    borderColor: "divider",
    p: { xs: 2.5, sm: 3.5 },
  };

  if (step === 2 && !isLoggedIn) {
    return (
      <Box component="form" onSubmit={handleAuthSubmit} noValidate sx={formShellSx}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" sx={{ mb: 1 }}>
              {emailExists ? "Welcome back!" : "Almost done"}
            </Typography>
            <Typography color="text.secondary">
              {emailExists
                ? `Sign in to continue listing ${values.streetAddress}.`
                : `Create a free account to track your listing at ${values.streetAddress}.`}
            </Typography>
          </Box>

          {state.error ? <Alert severity="error">{state.error}</Alert> : null}

          <TextField
            label="Email"
            value={values.email}
            fullWidth
            slotProps={{ input: { readOnly: true } }}
            sx={inputSx}
          />

          <TextField
            name="password"
            label="Password"
            type="password"
            autoComplete={emailExists ? "current-password" : "new-password"}
            required
            fullWidth
            error={Boolean(mergedErrors.password)}
            helperText={mergedErrors.password ?? (emailExists ? undefined : "At least 8 characters")}
            sx={inputSx}
          />

          {!emailExists ? (
            <TextField
              name="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              required
              fullWidth
              error={Boolean(mergedErrors.confirmPassword)}
              helperText={mergedErrors.confirmPassword}
              sx={inputSx}
            />
          ) : null}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={pending}
              sx={{ minWidth: 160 }}
            >
              {pending
                ? "Continuing…"
                : emailExists
                  ? "Sign in & continue"
                  : "Create account & continue"}
            </Button>
            <Button
              type="button"
              variant="text"
              onClick={() => {
                setStep(1);
                setErrors({});
              }}
            >
              Use a different email
            </Button>
          </Stack>
        </Stack>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleContinue} noValidate sx={formShellSx}>
      {state.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.error}
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="First Name"
            required
            value={values.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            error={Boolean(mergedErrors.firstName)}
            helperText={mergedErrors.firstName ?? " "}
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
            error={Boolean(mergedErrors.lastName)}
            helperText={mergedErrors.lastName ?? " "}
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
            error={Boolean(mergedErrors.email)}
            helperText={mergedErrors.email ?? " "}
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
            error={Boolean(mergedErrors.phone)}
            helperText={mergedErrors.phone ?? " "}
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
            error={Boolean(mergedErrors.streetAddress)}
            helperText={mergedErrors.streetAddress ?? " "}
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
            error={Boolean(mergedErrors.city)}
            helperText={mergedErrors.city ?? " "}
            autoComplete="address-level2"
            slotProps={{ formHelperText: { sx: { mx: 0, minHeight: 20 } } }}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth required error={Boolean(mergedErrors.state)}>
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
              {mergedErrors.state ?? " "}
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
            error={Boolean(mergedErrors.zip)}
            helperText={mergedErrors.zip ?? " "}
            autoComplete="postal-code"
            inputMode="numeric"
            slotProps={{ formHelperText: { sx: { mx: 0, minHeight: 20 } } }}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth required error={Boolean(mergedErrors.timeline)}>
            <InputLabel id="sell-inquiry-timeline-label" shrink>
              How soon do you want to sell?
            </InputLabel>
            <Select
              labelId="sell-inquiry-timeline-label"
              label="How soon do you want to sell?"
              value={values.timeline}
              onChange={(e) => updateField("timeline", e.target.value as Timeline)}
              displayEmpty
              renderValue={(selected) =>
                selected ? (
                  selected
                ) : (
                  <Typography component="span" color="text.secondary">
                    Select a timeline
                  </Typography>
                )
              }
              sx={{
                borderRadius: 3,
                backgroundColor: "background.default",
              }}
            >
              {TIMELINE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText sx={{ mx: 0, minHeight: 20 }}>
              {mergedErrors.timeline ?? " "}
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
        <Link href="/privacy" underline="hover" color="primary" sx={{ fontWeight: 600 }}>
          Privacy Policy
        </Link>
        {" | "}
        <Link href="/terms" underline="hover" color="primary" sx={{ fontWeight: 600 }}>
          Terms &amp; Conditions
        </Link>
        .
      </Typography>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        disabled={pending || checkingEmail}
        sx={{ mt: 3, width: { xs: "100%", sm: "auto" }, minWidth: 160 }}
      >
        {pending || checkingEmail
          ? "Continuing…"
          : isLoggedIn
            ? "Continue to listing"
            : "Continue"}
      </Button>
    </Box>
  );
}
