"use client";

import NextLink from "next/link";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import type { EmailTemplateListItem } from "@/lib/email/template-queries";

type EmailTemplateListProps = {
  templates: EmailTemplateListItem[];
};

function formatUpdatedAt(value: Date | string | null): string {
  if (!value) return "Default only";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EmailTemplateList({ templates }: EmailTemplateListProps) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Template</TableCell>
            <TableCell>Recipient</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Last updated</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.slug} hover>
              <TableCell>
                <Typography sx={{ fontWeight: 600 }}>{template.displayName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {template.description}
                </Typography>
              </TableCell>
              <TableCell>{template.recipientLabel}</TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                  {template.subject}
                </Typography>
              </TableCell>
              <TableCell>
                {template.isCustomized ? (
                  <Chip size="small" label="Customized" color="primary" />
                ) : (
                  <Chip size="small" label="Default" variant="outlined" />
                )}
              </TableCell>
              <TableCell>{formatUpdatedAt(template.updatedAt)}</TableCell>
              <TableCell align="right">
                <Button
                  component={NextLink}
                  href={`/crm/email-templates/${template.slug}`}
                  size="small"
                  variant="outlined"
                  startIcon={<EditOutlinedIcon />}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
