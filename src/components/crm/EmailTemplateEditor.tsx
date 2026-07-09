"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import type { EmailBrandTheme } from "@/lib/email/email-brand-config";
import { DEFAULT_EMAIL_BRAND_THEME } from "@/lib/email/email-brand-config";
import type { EmailTemplateDetail } from "@/lib/email/template-queries";
import { validateEmailTemplate } from "@/lib/email/validate-template";
import EmailBrandThemePanel from "@/components/crm/EmailBrandThemePanel";
import EmailMergeVariablesPanel from "@/components/crm/EmailMergeVariablesPanel";
import EmailPreviewPane from "@/components/crm/EmailPreviewPane";
import EmailVisualEditor, {
  type EmailVisualEditorHandle,
} from "@/components/crm/EmailVisualEditor";

type EditorView = "visual" | "code" | "preview";
type SidebarPanel = "brand" | "variables" | null;

type EmailTemplateEditorProps = {
  template: EmailTemplateDetail;
  adminEmail: string;
};

const sidebarAccordionSx = {
  border: 1,
  borderColor: "divider",
  borderRadius: "12px !important",
  backgroundColor: "background.paper",
  "&::before": { display: "none" },
  overflow: "hidden",
} as const;

function parseMergeToken(token: string): string | null {
  const match = /^\{\{(\w+)\}\}$/.exec(token.trim());
  return match?.[1] ?? null;
}

export default function EmailTemplateEditor({
  template,
  adminEmail,
}: EmailTemplateEditorProps) {
  const router = useRouter();
  const htmlBodyRef = useRef<HTMLTextAreaElement>(null);
  const visualEditorRef = useRef<EmailVisualEditorHandle>(null);
  const pendingInsertRef = useRef<string | null>(null);
  const [view, setView] = useState<EditorView>("visual");
  const [sidebarPanel, setSidebarPanel] = useState<SidebarPanel>("brand");
  const [subject, setSubject] = useState(template.subject);
  const [htmlBody, setHtmlBody] = useState(template.htmlBody);
  const [brandTheme, setBrandTheme] = useState<EmailBrandTheme>(
    DEFAULT_EMAIL_BRAND_THEME,
  );
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewSubject, setPreviewSubject] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saveWarnings, setSaveWarnings] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const knownVariableNames = useMemo(
    () => template.variables.map((variable) => variable.name),
    [template.variables],
  );

  const validation = useMemo(
    () => validateEmailTemplate(htmlBody, subject, knownVariableNames),
    [htmlBody, subject, knownVariableNames],
  );

  const handleBrandThemeChange = useCallback((theme: EmailBrandTheme) => {
    setBrandTheme(theme);
  }, []);

  const loadPreview = useCallback(async () => {
    setPreviewLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/crm/email-templates/${template.slug}/preview`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, htmlBody, brandTheme }),
        },
      );
      const data = (await response.json()) as {
        subject?: string;
        html?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load preview.");
      }
      setPreviewSubject(data.subject ?? null);
      setPreviewHtml(data.html ?? null);
    } catch (previewError) {
      setError(
        previewError instanceof Error
          ? previewError.message
          : "Failed to load preview.",
      );
    } finally {
      setPreviewLoading(false);
    }
  }, [brandTheme, htmlBody, subject, template.slug]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  useEffect(() => {
    if (!pendingInsertRef.current) {
      return;
    }

    const token = pendingInsertRef.current;
    pendingInsertRef.current = null;
    const variableName = parseMergeToken(token);

    requestAnimationFrame(() => {
      if (view === "visual" && variableName) {
        visualEditorRef.current?.insertMergeVariable(variableName);
        return;
      }

      if (view !== "code") {
        return;
      }

      const textarea = htmlBodyRef.current;
      if (!textarea) {
        setHtmlBody((current) => `${current}${token}`);
        return;
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const nextValue = `${textarea.value.slice(0, start)}${token}${textarea.value.slice(end)}`;
      setHtmlBody(nextValue);
      textarea.focus();
      const cursor = start + token.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }, [view]);

  function insertAtCursor(token: string) {
    const variableName = parseMergeToken(token);

    if (view === "visual" && variableName) {
      visualEditorRef.current?.insertMergeVariable(variableName);
      return;
    }

    if (view === "preview") {
      pendingInsertRef.current = token;
      setView(variableName ? "visual" : "code");
      return;
    }

    const textarea = htmlBodyRef.current;
    if (!textarea) {
      setHtmlBody((current) => `${current}${token}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextValue = `${htmlBody.slice(0, start)}${token}${htmlBody.slice(end)}`;
    setHtmlBody(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + token.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  async function handleSave() {
    if (validation.errors.length > 0) {
      setError(validation.errors[0]);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    setSaveWarnings([]);
    try {
      const response = await fetch(`/api/crm/email-templates/${template.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, htmlBody }),
      });
      const data = (await response.json()) as {
        error?: string;
        warnings?: string[];
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save template.");
      }
      setSaveWarnings(data.warnings ?? []);
      setSuccess("Template saved.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save template.");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setResetting(true);
    setError(null);
    setSuccess(null);
    setSaveWarnings([]);
    try {
      const response = await fetch(`/api/crm/email-templates/${template.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset: true }),
      });
      const data = (await response.json()) as {
        template?: EmailTemplateDetail;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to reset template.");
      }
      if (data.template) {
        setSubject(data.template.subject);
        setHtmlBody(data.template.htmlBody);
      }
      setSuccess("Template reset to default.");
      setResetOpen(false);
      router.refresh();
    } catch (resetError) {
      setError(
        resetError instanceof Error ? resetError.message : "Failed to reset template.",
      );
    } finally {
      setResetting(false);
    }
  }

  async function handleSendTest(to: string) {
    setTestSending(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(
        `/api/crm/email-templates/${template.slug}/test-send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, htmlBody, brandTheme, to }),
        },
      );
      const data = (await response.json()) as { error?: string; to?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to send test email.");
      }
      setSuccess(`Test email sent to ${data.to ?? to}.`);
    } catch (sendError) {
      setError(
        sendError instanceof Error ? sendError.message : "Failed to send test email.",
      );
    } finally {
      setTestSending(false);
    }
  }

  const activeWarnings =
    saveWarnings.length > 0 ? saveWarnings : validation.warnings;

  return (
    <Stack spacing={3}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}
      {validation.errors.length > 0 ? (
        <Alert severity="error">{validation.errors[0]}</Alert>
      ) : null}
      {activeWarnings.length > 0 ? (
        <Alert severity="warning">
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Template warnings
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {activeWarnings.map((warning) => (
              <li key={warning}>
                <Typography variant="body2">{warning}</Typography>
              </li>
            ))}
          </Box>
        </Alert>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 280px" },
        }}
      >
        <Stack spacing={2}>
          <TextField
            label="Subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            fullWidth
          />

          <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Box
              sx={{
                px: 2,
                py: 1.25,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "grey.50",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{
                  alignItems: { xs: "stretch", sm: "center" },
                  justifyContent: "space-between",
                }}
              >
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  color="primary"
                  value={view === "preview" ? null : view}
                  aria-label="Editor view"
                  onChange={(_event, value: "visual" | "code" | null) => {
                    if (value) setView(value);
                  }}
                >
                  <ToggleButton value="visual" aria-label="Visual mode">
                    <EditNoteOutlinedIcon fontSize="small" sx={{ mr: 0.75 }} />
                    Visual
                  </ToggleButton>
                  <ToggleButton value="code" aria-label="Code mode">
                    <CodeOutlinedIcon fontSize="small" sx={{ mr: 0.75 }} />
                    Code
                  </ToggleButton>
                </ToggleButtonGroup>

                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                  <Button
                    size="small"
                    variant={view === "preview" ? "contained" : "outlined"}
                    startIcon={<VisibilityOutlinedIcon />}
                    onClick={() => {
                      if (view === "preview") {
                        void loadPreview();
                        return;
                      }
                      setView("preview");
                    }}
                    disabled={previewLoading}
                  >
                    {previewLoading ? "Loading…" : "Preview"}
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<SaveOutlinedIcon />}
                    onClick={() => void handleSave()}
                    disabled={saving || validation.errors.length > 0}
                  >
                    {saving ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    startIcon={<RestartAltOutlinedIcon />}
                    onClick={() => setResetOpen(true)}
                  >
                    Reset
                  </Button>
                </Stack>
              </Stack>
            </Box>

            {view === "code" ? (
              <Box sx={{ p: 2 }}>
                <TextField
                  inputRef={htmlBodyRef}
                  label="HTML body"
                  value={htmlBody}
                  onChange={(event) => setHtmlBody(event.target.value)}
                  fullWidth
                  multiline
                  minRows={22}
                  slotProps={{
                    input: {
                      sx: { fontFamily: "monospace", fontSize: 13 },
                    },
                  }}
                />
              </Box>
            ) : null}

            {view === "visual" ? (
              <EmailVisualEditor
                ref={visualEditorRef}
                htmlBody={htmlBody}
                layout={template.layout}
                brandTheme={brandTheme}
                onChange={setHtmlBody}
              />
            ) : null}

            {view === "preview" ? (
              <EmailPreviewPane
                previewHtml={previewHtml}
                previewSubject={previewSubject}
                previewLoading={previewLoading}
                adminEmail={adminEmail}
                onSendTest={handleSendTest}
                testSending={testSending}
              />
            ) : null}
          </Paper>
        </Stack>

        <Stack spacing={1.5} sx={{ alignSelf: "start" }}>
          <Accordion
            disableGutters
            elevation={0}
            expanded={sidebarPanel === "brand"}
            onChange={(_event, expanded) => {
              setSidebarPanel(expanded ? "brand" : null);
            }}
            sx={sidebarAccordionSx}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                px: 2,
                py: 0.5,
                "& .MuiAccordionSummary-content": { my: 1.25 },
              }}
            >
              <Typography variant="subtitle2">Brand &amp; style</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
              <EmailBrandThemePanel onThemeChange={handleBrandThemeChange} />
            </AccordionDetails>
          </Accordion>

          <Accordion
            disableGutters
            elevation={0}
            expanded={sidebarPanel === "variables"}
            onChange={(_event, expanded) => {
              setSidebarPanel(expanded ? "variables" : null);
            }}
            sx={sidebarAccordionSx}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                px: 2,
                py: 0.5,
                "& .MuiAccordionSummary-content": { my: 1.25 },
              }}
            >
              <Typography variant="subtitle2">Merge variables</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
              <EmailMergeVariablesPanel
                variables={template.variables}
                onInsert={insertAtCursor}
              />
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Box>

      <Dialog open={resetOpen} onClose={() => setResetOpen(false)}>
        <DialogTitle>Reset to default?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will replace the subject and HTML body with the bundled default template.
            Your custom changes will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)}>Cancel</Button>
          <Button color="warning" onClick={() => void handleReset()} disabled={resetting}>
            {resetting ? "Resetting…" : "Reset"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
