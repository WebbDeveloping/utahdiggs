"use client";

import NextLink from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import type { AgreementTemplateFieldMapStatus } from "@/lib/crm/agreement-template-queries";

export type AgreementTemplateListRow = {
  id: string;
  slug: string;
  version: string;
  displayName: string;
  revisionLabel: string | null;
  byteSize: number | null;
  createdAt: Date | string;
  fieldMapStatus: AgreementTemplateFieldMapStatus;
};

type AgreementTemplateListProps = {
  templates: AgreementTemplateListRow[];
};

function formatBytes(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fieldMapStatusChip(status: AgreementTemplateFieldMapStatus) {
  switch (status) {
    case "blob":
      return <Chip size="small" label="Field map saved" color="success" />;
    case "bundled":
      return <Chip size="small" label="Bundled fallback" color="info" />;
    default:
      return <Chip size="small" label="No field map" variant="outlined" />;
  }
}

function buildMapperHref(slug: string, version: string): string {
  const params = new URLSearchParams({ slug, version });
  return `/crm/agreement-templates/field-mapper?${params.toString()}`;
}

function buildPdfHref(slug: string, version: string): string {
  const params = new URLSearchParams({ version });
  return `/api/crm/agreement-templates/${slug}/pdf?${params.toString()}`;
}

export default function AgreementTemplateList({ templates }: AgreementTemplateListProps) {
  return (
    <Stack spacing={2}>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          component={NextLink}
          href="/crm/agreement-templates/new"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Add template
        </Button>
      </Box>

      {templates.length === 0 ? (
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography color="text.secondary">
            No agreement templates yet. Upload a PDF to get started.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Template</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Field map</TableCell>
                <TableCell>Size</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>{template.displayName}</Typography>
                    {template.revisionLabel ? (
                      <Typography variant="body2" color="text.secondary">
                        {template.revisionLabel}
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                      {template.slug}
                    </Typography>
                  </TableCell>
                  <TableCell>{template.version}</TableCell>
                  <TableCell>{fieldMapStatusChip(template.fieldMapStatus)}</TableCell>
                  <TableCell>{formatBytes(template.byteSize)}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                      <Button
                        component="a"
                        href={buildPdfHref(template.slug, template.version)}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        startIcon={<PictureAsPdfOutlinedIcon />}
                      >
                        PDF
                      </Button>
                      <Button
                        component={NextLink}
                        href={buildMapperHref(template.slug, template.version)}
                        size="small"
                        variant="outlined"
                        startIcon={<MapOutlinedIcon />}
                      >
                        Map fields
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
