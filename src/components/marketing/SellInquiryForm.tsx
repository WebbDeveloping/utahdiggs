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
import PhoneTextField from "@/components/ui/PhoneTextField";

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

const emptyForm = (
  initialAddress = "",
  initialCity = "",
  initialState = "",
  initialZip = "",
): FormValues => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  streetAddress: initialAddress,
  city: initialCity,
  state: initialState === "UT" || initialState.toLowerCase() === "utah" ? "Utah" : initialState || "Utah",
  zip: initialZip,
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
  initialCity?: string;
  initialState?: string;
  initialZip?: string;
  isLoggedIn?: boolean;
};

export default function SellInquiryForm({
  initialAddress = "",
  initialCity = "",
  initialState = "",
  initialZip = "",
  isLoggedIn = false,
}: SellInquiryFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<FormValues>(() =>
    emptyForm(initialAddress, initialCity, initialState, initialZip),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [emailExists, setEmailExists] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
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

  function handleStepOneSubmit(event: FormEvent<HTMLFormElement>) {
    const nextErrors = validateStepOne(values);
    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    if (!isLoggedIn) {
      event.preventDefault();
      startEmailCheck(async () => {
        const result = await checkSellInquiryEmailAction(values.email);
        setEmailExists(result.exists);
        setAuthMode(result.exists ? "signin" : "signup");
        setStep(2);
      });
    }
  }

  const inquiryHiddenFields = (
    <>
      <input type="hidden" name="firstName" value={values.firstName.trim()} />
      <input type="hidden" name="lastName" value={values.lastName.trim()} />
      <input type="hidden" name="phone" value={values.phone.trim()} />
      <input type="hidden" name="streetAddress" value={values.streetAddress.trim()} />
      <input type="hidden" name="city" value={values.city.trim()} />
      <input type="hidden" name="state" value={values.state} />
      <input type="hidden" name="zip" value={values.zip.trim()} />
      <input type="hidden" name="timeline" value={values.timeline} />
    </>
  );

  const formShellSx = {
    backgroundColor: "background.paper",
    borderRadius: 4,
    boxShadow: "0 4px 24px rgba(19, 33, 28, 0.08)",
    border: "1px solid",
    borderColor: "divider",
    p: { xs: 2.5, sm: 3.5 },
  };

  if (step === 2 && !isLoggedIn) {
    const isSignIn = authMode === "signin";
    const emailLocked = isSignIn && emailExists;

    return (
      <Box component="form" action={formAction} noValidate sx={formShellSx}>
        <Stack spacing={3}>
          {inquiryHiddenFields}
          <input type="hidden" name="emailExists" value={String(isSignIn)} />
          {!isSignIn || emailLocked ? (
            <input type="hidden" name="email" value={values.email.trim().toLowerCase()} />
          ) : null}

          <Box>
            <Typography variant="h5" sx={{ mb: 1 }}>
              {emailLocked ? "Welcome back!" : isSignIn ? "Sign in to continue" : "Almost done"}
            </Typography>
            <Typography color="text.secondary">
              {emailLocked
                ? `Sign in to continue listing ${values.streetAddress}.`
                : isSignIn
                  ? `Use your existing account to continue listing ${values.streetAddress}.`
                  : `Create a free account to track your listing at ${values.streetAddress}.`}
            </Typography>
          </Box>

          {state.error ? <Alert severity="error">{state.error}</Alert> : null}

          {isSignIn && !emailLocked ? (
            <TextField
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              required
              fullWidth
              value={values.email}
              onChange={(e) => updateField("email", e.target.value)}
              error={Boolean(mergedErrors.email)}
              helperText={mergedErrors.email}
              sx={inputSx}
            />
          ) : (
            <TextField
              label="Email"
              value={values.email}
              fullWidth
              slotProps={{ input: { readOnly: true } }}
              sx={inputSx}
            />
          )}

          <TextField
            name="password"
            label="Password"
            type="password"
            autoComplete={isSignIn ? "current-password" : "new-password"}
            required
            fullWidth
            error={Boolean(mergedErrors.password)}
            helperText={mergedErrors.password ?? (isSignIn ? undefined : "At least 8 characters")}
            sx={inputSx}
          />

          {!isSignIn ? (
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
                : isSignIn
                  ? "Sign in & continue"
                  : "Create account & continue"}
            </Button>
            <Button
              type="button"
              variant="text"
              onClick={() => {
                setStep(1);
                setAuthMode("signup");
                setErrors({});
              }}
            >
              Use a different email
            </Button>
          </Stack>

          {!emailLocked ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
              {isSignIn ? (
                <>
                  Need a new account?{" "}
                  <Link
                    component="button"
                    type="button"
                    underline="hover"
                    color="primary"
                    sx={{ fontWeight: 600, verticalAlign: "baseline" }}
                    onClick={() => {
                      setAuthMode("signup");
                      setErrors({});
                    }}
                  >
                    Create one instead
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link
                    component="button"
                    type="button"
                    underline="hover"
                    color="primary"
                    sx={{ fontWeight: 600, verticalAlign: "baseline" }}
                    onClick={() => {
                      setAuthMode("signin");
                      setErrors({});
                    }}
                  >
                    Sign in
                  </Link>
                </>
              )}
            </Typography>
          ) : null}
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      action={isLoggedIn ? formAction : undefined}
      onSubmit={handleStepOneSubmit}
      noValidate
      sx={formShellSx}
    >
      {state.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.error}
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            name="firstName"
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
            name="lastName"
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
            name="email"
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
          <PhoneTextField
            fullWidth
            name="phone"
            label="Phone"
            required
            value={values.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            error={Boolean(mergedErrors.phone)}
            helperText={mergedErrors.phone ?? " "}
            slotProps={{ formHelperText: { sx: { mx: 0, minHeight: 20 } } }}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            name="streetAddress"
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
            name="city"
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
              name="state"
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
            name="zip"
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
              name="timeline"
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
