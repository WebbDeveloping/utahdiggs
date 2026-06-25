"use client";

import { useActionState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import Logo from "@/components/ui/Logo";
import { appendNextParam, isListingFlowRedirect } from "@/lib/auth/safe-redirect";
import { consumerLoginAction, type ConsumerAuthState } from "@/lib/consumer/actions";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    backgroundColor: "background.default",
  },
};

type ConsumerLoginFormProps = {
  next?: string;
};

export default function ConsumerLoginForm({ next }: ConsumerLoginFormProps) {
  const [state, formAction, pending] = useActionState<ConsumerAuthState, FormData>(
    consumerLoginAction,
    {},
  );

  const signupHref = appendNextParam("/signup", next);
  const isListingFlow = isListingFlowRedirect(next);

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 420,
        p: { xs: 3, sm: 4 },
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack spacing={3}>
        <Box sx={{ textAlign: "center" }}>
          <Box sx={{ display: "inline-flex", mb: 2 }}>
            <Logo />
          </Box>
          <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", sm: "1.75rem" } }}>
            Sign in
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {isListingFlow
              ? "Sign in to list your home and track your submission."
              : "Access your saved homes, searches, and listings."}
          </Typography>
        </Box>

        {state.error ? <Alert severity="error">{state.error}</Alert> : null}

        <Box component="form" action={formAction}>
          <Stack spacing={2.5}>
            {next ? <input type="hidden" name="next" value={next} /> : null}
            <TextField
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              required
              fullWidth
              error={Boolean(state.fieldErrors?.email)}
              helperText={state.fieldErrors?.email}
              sx={inputSx}
            />
            <TextField
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              fullWidth
              error={Boolean(state.fieldErrors?.password)}
              helperText={state.fieldErrors?.password}
              sx={inputSx}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={pending}
              sx={{ mt: 1 }}
            >
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
          Don&apos;t have an account?{" "}
          <Link
            component={NextLink}
            href={signupHref}
            underline="hover"
            sx={{ fontWeight: 600 }}
          >
            Sign up
          </Link>
        </Typography>
      </Stack>
    </Paper>
  );
}
