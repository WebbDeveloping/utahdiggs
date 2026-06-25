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
import { consumerSignupAction, type ConsumerAuthState } from "@/lib/consumer/actions";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    backgroundColor: "background.default",
  },
};

export default function ConsumerSignupForm() {
  const [state, formAction, pending] = useActionState<ConsumerAuthState, FormData>(
    consumerSignupAction,
    {},
  );

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
            Create account
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Save homes, track searches, and manage your selling activity.
          </Typography>
        </Box>

        {state.error ? <Alert severity="error">{state.error}</Alert> : null}

        <Box component="form" action={formAction}>
          <Stack spacing={2.5}>
            <TextField
              name="name"
              label="Name (optional)"
              autoComplete="name"
              fullWidth
              error={Boolean(state.fieldErrors?.name)}
              helperText={state.fieldErrors?.name}
              sx={inputSx}
            />
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
              autoComplete="new-password"
              required
              fullWidth
              error={Boolean(state.fieldErrors?.password)}
              helperText={state.fieldErrors?.password ?? "At least 8 characters"}
              sx={inputSx}
            />
            <TextField
              name="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              required
              fullWidth
              error={Boolean(state.fieldErrors?.confirmPassword)}
              helperText={state.fieldErrors?.confirmPassword}
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
              {pending ? "Creating account…" : "Create account"}
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
          Already have an account?{" "}
          <Link
            component={NextLink}
            href="/login"
            underline="hover"
            sx={{ fontWeight: 600 }}
          >
            Sign in
          </Link>
        </Typography>
      </Stack>
    </Paper>
  );
}
