"use client";

import { useMemo, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { slugifyDisplayName } from "@/lib/crm/agreement-template-utils";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "background.default",
  },
};

function todayVersion(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AgreementTemplateUploadForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [version, setVersion] = useState(todayVersion);
  const [revisionLabel, setRevisionLabel] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const suggestedSlug = useMemo(() => slugifyDisplayName(displayName), [displayName]);
  const effectiveSlug = slugTouched ? slug : suggestedSlug;

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    if (!slugTouched) {
      setSlug(slugifyDisplayName(value));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError("Select a PDF file to upload.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("displayName", displayName.trim());
      formData.append("version", version.trim());
      formData.append("slug", effectiveSlug.trim());
      if (revisionLabel.trim()) {
        formData.append("revisionLabel", revisionLabel.trim());
      }

      const response = await fetch("/api/crm/agreement-templates", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        error?: string;
        template?: { slug: string; version: string };
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Upload failed.");
      }

      const template = payload.template;
      if (!template) {
        throw new Error("Upload succeeded but no template was returned.");
      }

      const params = new URLSearchParams({
        slug: template.slug,
        version: template.version,
      });
      router.push(`/crm/agreement-templates/field-mapper?${params.toString()}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, borderRadius: 2, maxWidth: 720 }}>
      <Stack spacing={2.5}>
        <Typography color="text.secondary">
          Upload a blank PDF agreement template. After upload you will be taken to the field mapper
          to place text, checkbox, and signature fields.
        </Typography>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <TextField
          label="Display name"
          value={displayName}
          onChange={(event) => handleDisplayNameChange(event.target.value)}
          required
          fullWidth
          sx={inputSx}
        />

        <TextField
          label="Slug"
          value={effectiveSlug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          required
          fullWidth
          helperText="Lowercase letters, numbers, and hyphens only. Used in API paths and field maps."
          sx={inputSx}
        />

        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
          <TextField
            label="Version"
            value={version}
            onChange={(event) => setVersion(event.target.value)}
            required
            helperText="Use a date or revision id. New PDF revisions need a new version."
            sx={inputSx}
          />
          <TextField
            label="Revision label (optional)"
            value={revisionLabel}
            onChange={(event) => setRevisionLabel(event.target.value)}
            sx={inputSx}
          />
        </Box>

        <Button variant="outlined" component="label" sx={{ alignSelf: "flex-start" }}>
          {file ? file.name : "Choose PDF"}
          <input
            type="file"
            hidden
            accept="application/pdf,.pdf"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </Button>

        <Stack direction="row" spacing={1.5}>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Uploading…" : "Upload and map fields"}
          </Button>
          <Button component={NextLink} href="/crm/agreement-templates" disabled={loading}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
