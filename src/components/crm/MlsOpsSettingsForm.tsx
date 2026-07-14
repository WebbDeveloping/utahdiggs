"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import ClearIcon from "@mui/icons-material/Clear";
import {
  saveMlsOpsSettingsAction,
  type MlsOpsSettingsActionState,
} from "@/lib/crm/mls-ops-actions";

type AgentOption = {
  id: string;
  name: string | null;
  email: string;
};

type MlsOpsSettingsFormProps = {
  agents: AgentOption[];
  defaultVaUserId: string | null;
  fallbackEmail: string | null;
  /** Effective env default when DB fallback email is empty */
  envDefaultEmail: string;
};

const initialState: MlsOpsSettingsActionState = {};

export default function MlsOpsSettingsForm({
  agents,
  defaultVaUserId,
  fallbackEmail,
  envDefaultEmail,
}: MlsOpsSettingsFormProps) {
  const router = useRouter();
  const [vaUserId, setVaUserId] = useState(defaultVaUserId ?? "");
  const [email, setEmail] = useState(fallbackEmail ?? "");
  const [state, formAction, pending] = useActionState(
    saveMlsOpsSettingsAction,
    initialState,
  );

  useEffect(() => {
    setVaUserId(defaultVaUserId ?? "");
    setEmail(fallbackEmail ?? "");
  }, [defaultVaUserId, fallbackEmail]);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  const hasSavedOverride = Boolean(fallbackEmail?.trim());
  const hasTypedOverride = Boolean(email.trim());

  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2.5, sm: 3 }, border: "1px solid", borderColor: "divider" }}
    >
      <Stack spacing={2} component="form" action={formAction}>
        <Typography variant="h6">MLS VA settings</Typography>
        <Typography variant="body2" color="text.secondary">
          Notification emails use the address below (or{" "}
          <code>MLS_VA_NOTIFICATION_EMAIL</code> when blank). The CRM Agent is for
          queue access only — their login email is not used for notifications.
        </Typography>

        <Alert severity="info">
          Currently notifying:{" "}
          <strong>{fallbackEmail?.trim() || envDefaultEmail}</strong>
          {fallbackEmail?.trim() ? " (saved override)" : " (from env)"}
        </Alert>

        <input type="hidden" name="defaultVaUserId" value={vaUserId} />
        <FormControl fullWidth size="small">
          <InputLabel id="mls-default-va-label">Default MLS VA (CRM login)</InputLabel>
          <Select
            labelId="mls-default-va-label"
            label="Default MLS VA (CRM login)"
            value={vaUserId}
            onChange={(e) => setVaUserId(e.target.value)}
          >
            <MenuItem value="">
              <em>None — admins / assigned agents only</em>
            </MenuItem>
            {agents.map((agent) => (
              <MenuItem key={agent.id} value={agent.id}>
                {agent.name ? `${agent.name} (${agent.email})` : agent.email}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          name="fallbackEmail"
          label="Notification email override"
          type="email"
          size="small"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={envDefaultEmail}
          helperText={
            hasSavedOverride
              ? "Use Clear override to delete the saved address and return to the env default."
              : `Leave blank to use ${envDefaultEmail} from env.`
          }
          fullWidth
          slotProps={{
            input: {
              endAdornment: hasTypedOverride ? (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Clear notification email field"
                    edge="end"
                    size="small"
                    disabled={pending}
                    onClick={() => setEmail("")}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />

        {state.error ? <Alert severity="error">{state.error}</Alert> : null}
        {state.success ? (
          <Alert severity="success">
            {state.clearedOverride
              ? "Override removed. Notifications use the env default."
              : "MLS VA settings saved."}
          </Alert>
        ) : null}

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Button type="submit" variant="contained" disabled={pending}>
            {pending ? "Saving…" : "Save settings"}
          </Button>
          {hasSavedOverride ? (
            <Button
              type="submit"
              name="clearOverride"
              value="1"
              variant="outlined"
              color="inherit"
              disabled={pending}
            >
              Clear override
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
}
