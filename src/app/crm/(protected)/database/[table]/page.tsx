import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import LinkButton from "@/components/ui/LinkButton";
import { auth } from "@/lib/auth/admin-auth";
import { canManageUsers } from "@/lib/auth/roles";
import { getSessionUser } from "@/lib/crm/access";
import {
  type DatabaseCell,
  getDatabaseTablePage,
  isDatabaseTableKey,
} from "@/lib/crm/database-browser";

const headerCellSx = {
  color: "text.secondary",
  fontWeight: 600,
  fontSize: "0.8125rem",
  letterSpacing: "0.02em",
  textTransform: "uppercase" as const,
  whiteSpace: "nowrap" as const,
  borderBottomColor: "divider",
  backgroundColor: "background.default",
};

function shortenId(value: string): string {
  if (value.length <= 12) {
    return value;
  }
  return `${value.slice(0, 8)}…`;
}

function DatabaseValueCell({ cell }: { cell: DatabaseCell }) {
  if (!cell.value) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }

  if (cell.tone === "status") {
    const chip = (
      <Chip
        label={cell.value}
        size="small"
        variant="outlined"
        sx={{
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "none",
          borderColor: "divider",
          color: "text.primary",
          backgroundColor: "primary.light",
        }}
      />
    );

    if (cell.href) {
      return (
        <Link href={cell.href} style={{ textDecoration: "none" }}>
          {chip}
        </Link>
      );
    }

    return chip;
  }

  if (cell.tone === "boolean") {
    return (
      <Chip
        label={cell.value}
        size="small"
        color={cell.value === "Yes" ? "primary" : "default"}
        variant={cell.value === "Yes" ? "filled" : "outlined"}
        sx={{
          fontWeight: 600,
          letterSpacing: 0,
          textTransform: "none",
        }}
      />
    );
  }

  if (cell.tone === "id") {
    const label = (
      <Typography
        variant="body2"
        title={cell.value}
        sx={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: "0.8125rem",
          fontWeight: cell.href ? 600 : 500,
          color: cell.href ? "primary.main" : "text.secondary",
        }}
      >
        {shortenId(cell.value)}
      </Typography>
    );

    if (cell.href) {
      return (
        <Link href={cell.href} style={{ textDecoration: "none" }}>
          {label}
        </Link>
      );
    }

    return label;
  }

  if (cell.href) {
    return (
      <Link
        href={cell.href}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
          {cell.value}
        </Typography>
      </Link>
    );
  }

  return (
    <Typography
      variant="body2"
      color={cell.tone === "muted" ? "text.secondary" : "text.primary"}
      sx={{
        maxWidth: 280,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
      title={cell.value}
    >
      {cell.value}
    </Typography>
  );
}

type CrmDatabaseTablePageProps = {
  params: Promise<{ table: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function CrmDatabaseTablePage({
  params,
  searchParams,
}: CrmDatabaseTablePageProps) {
  const session = await auth();
  const user = getSessionUser(session);

  if (!user || !canManageUsers(user.role)) {
    redirect("/crm");
  }

  const { table: tableKey } = await params;
  if (!isDatabaseTableKey(tableKey)) {
    notFound();
  }

  const { page: pageParam } = await searchParams;
  const page = Number.parseInt(pageParam ?? "1", 10);
  const result = await getDatabaseTablePage(tableKey, page);

  const from =
    result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const to = Math.min(result.page * result.pageSize, result.total);

  return (
    <>
      <LinkButton
        href="/crm/database"
        startIcon={<ArrowBackOutlinedIcon />}
        size="small"
        variant="outlined"
        sx={{ mb: 2 }}
      >
        All tables
      </LinkButton>
      <CrmPageHeader
        title={result.table.label}
        description={
          result.total === 0
            ? "No rows in this table yet."
            : `Showing ${from.toLocaleString()}–${to.toLocaleString()} of ${result.total.toLocaleString()} rows`
        }
      />
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider", overflowX: "auto" }}
      >
        <Table size="medium">
          <TableHead>
            <TableRow>
              {result.columns.map((column) => (
                <TableCell key={column.key} sx={headerCellSx}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {result.rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={result.columns.length}>
                  <Typography
                    color="text.secondary"
                    sx={{ py: 3, textAlign: "center" }}
                  >
                    No rows in this table.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              result.rows.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  hover
                  sx={{
                    "&:last-child td": { borderBottom: 0 },
                  }}
                >
                  {row.map((cell, cellIndex) => (
                    <TableCell
                      key={`${rowIndex}-${result.columns[cellIndex]?.key}`}
                      sx={{ verticalAlign: "middle" }}
                    >
                      <DatabaseValueCell cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Paper
        elevation={0}
        sx={{
          mt: 2,
          px: 2,
          py: 1.5,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            alignItems: { sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Page {result.page} of {result.totalPages}
          </Typography>
          <Stack direction="row" spacing={1}>
            {result.page <= 1 ? (
              <Button size="small" variant="outlined" disabled>
                Previous
              </Button>
            ) : (
              <LinkButton
                href={`/crm/database/${tableKey}?page=${result.page - 1}`}
                size="small"
                variant="outlined"
              >
                Previous
              </LinkButton>
            )}
            {result.page >= result.totalPages ? (
              <Button size="small" variant="outlined" disabled>
                Next
              </Button>
            ) : (
              <LinkButton
                href={`/crm/database/${tableKey}?page=${result.page + 1}`}
                size="small"
                variant="outlined"
              >
                Next
              </LinkButton>
            )}
          </Stack>
        </Stack>
      </Paper>
    </>
  );
}
