"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import type { EmailTemplateVariable } from "@/lib/email/template-definitions";

type EmailMergeVariablesPanelProps = {
  variables: EmailTemplateVariable[];
  onInsert: (token: string) => void;
};

export default function EmailMergeVariablesPanel({
  variables,
  onInsert,
}: EmailMergeVariablesPanelProps) {
  async function copyVariable(name: string) {
    try {
      await navigator.clipboard.writeText(`{{${name}}}`);
    } catch {
      // Clipboard may be unavailable in some contexts.
    }
  }

  return (
    <Stack spacing={1}>
      {variables.map((variable) => (
        <Box key={variable.name}>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ mb: 0.25, alignItems: "center" }}
          >
            <Chip
              size="small"
              label={`{{${variable.name}}}`}
              sx={{ fontFamily: "monospace" }}
            />
            <Button
              size="small"
              aria-label={`Insert {{${variable.name}}}`}
              onClick={() => onInsert(`{{${variable.name}}}`)}
              sx={{ minWidth: 0, px: 0.75 }}
            >
              <AddOutlinedIcon fontSize="small" />
            </Button>
            <Button
              size="small"
              aria-label={`Copy {{${variable.name}}}`}
              onClick={() => void copyVariable(variable.name)}
              sx={{ minWidth: 0, px: 0.75 }}
            >
              <ContentCopyOutlinedIcon fontSize="small" />
            </Button>
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block" }}
          >
            {variable.description}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}
