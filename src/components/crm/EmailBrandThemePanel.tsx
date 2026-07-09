"use client";

import { useCallback, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
  DEFAULT_EMAIL_BRAND_THEME,
  type EmailBrandTheme,
} from "@/lib/email/email-brand-config";

type EmailBrandThemePanelProps = {
  onThemeChange: (theme: EmailBrandTheme) => void;
};

type ColorFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <TextField
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        size="small"
        slotProps={{ input: { sx: { fontFamily: "monospace", fontSize: 13 } } }}
        sx={{ flex: 1 }}
      />
      <Box
        component="input"
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`${label} color picker`}
        sx={{
          width: 40,
          height: 40,
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          p: 0.25,
          cursor: "pointer",
          bgcolor: "background.paper",
        }}
      />
    </Stack>
  );
}

export default function EmailBrandThemePanel({
  onThemeChange,
}: EmailBrandThemePanelProps) {
  const [theme, setTheme] = useState<EmailBrandTheme>(DEFAULT_EMAIL_BRAND_THEME);
  const [savedTheme, setSavedTheme] = useState<EmailBrandTheme>(
    DEFAULT_EMAIL_BRAND_THEME,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadTheme() {
      try {
        const response = await fetch("/api/crm/email-brand");
        const text = await response.text();
        let data: { theme?: EmailBrandTheme; error?: string } = {};
        if (text) {
          try {
            data = JSON.parse(text) as {
              theme?: EmailBrandTheme;
              error?: string;
            };
          } catch {
            throw new Error(
              response.ok
                ? "Failed to load brand settings."
                : `Failed to load brand settings (${response.status}).`,
            );
          }
        }
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load brand settings.");
        }
        if (data.theme) {
          setTheme(data.theme);
          setSavedTheme(data.theme);
          onThemeChange(data.theme);
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load brand settings.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadTheme();
  }, [onThemeChange]);

  const updateTheme = useCallback(
    (partial: Partial<EmailBrandTheme>) => {
      setTheme((current) => {
        const next = { ...current, ...partial };
        onThemeChange(next);
        return next;
      });
      setSuccess(null);
    },
    [onThemeChange],
  );

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/crm/email-brand", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      });
      const data = (await response.json()) as {
        theme?: EmailBrandTheme;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save brand settings.");
      }
      if (data.theme) {
        setTheme(data.theme);
        setSavedTheme(data.theme);
        onThemeChange(data.theme);
      }
      setSuccess("Brand settings saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save brand settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  const isDirty = JSON.stringify(theme) !== JSON.stringify(savedTheme);

  if (loading) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading…
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
        Global brand colors apply to all emails using theme tokens. Reset a
        template to default or edit its HTML to adopt tokens.
      </Typography>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <ColorField
        label="Primary"
        value={theme.primaryColor}
        onChange={(value) => updateTheme({ primaryColor: value })}
      />
      <ColorField
        label="Page background"
        value={theme.pageBackground}
        onChange={(value) => updateTheme({ pageBackground: value })}
      />
      <ColorField
        label="Card background"
        value={theme.cardBackground}
        onChange={(value) => updateTheme({ cardBackground: value })}
      />
      <ColorField
        label="Body text"
        value={theme.bodyTextColor}
        onChange={(value) => updateTheme({ bodyTextColor: value })}
      />
      <ColorField
        label="Muted text"
        value={theme.mutedTextColor}
        onChange={(value) => updateTheme({ mutedTextColor: value })}
      />
      <ColorField
        label="Link color"
        value={theme.linkColor}
        onChange={(value) => updateTheme({ linkColor: value })}
      />
      <ColorField
        label="Accent background"
        value={theme.accentBackground}
        onChange={(value) => updateTheme({ accentBackground: value })}
      />
      <TextField
        label="Button radius"
        value={theme.buttonRadius}
        onChange={(event) => updateTheme({ buttonRadius: event.target.value })}
        size="small"
        slotProps={{ input: { sx: { fontFamily: "monospace", fontSize: 13 } } }}
        helperText="e.g. 10px"
      />
      <Button
        variant="contained"
        size="small"
        startIcon={<SaveOutlinedIcon />}
        onClick={() => void handleSave()}
        disabled={saving || !isDirty}
      >
        {saving ? "Saving…" : "Save brand settings"}
      </Button>
    </Stack>
  );
}
