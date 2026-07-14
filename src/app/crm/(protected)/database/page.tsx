import Link from "next/link";
import { redirect } from "next/navigation";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import { auth } from "@/lib/auth/admin-auth";
import { canManageUsers } from "@/lib/auth/roles";
import { getSessionUser } from "@/lib/crm/access";
import { getDatabaseOverview } from "@/lib/crm/database-browser";

const headerCellSx = {
  color: "text.secondary",
  fontWeight: 600,
  fontSize: "0.8125rem",
  letterSpacing: "0.02em",
  textTransform: "uppercase" as const,
  borderBottomColor: "divider",
  backgroundColor: "background.default",
};

export default async function CrmDatabasePage() {
  const session = await auth();
  const user = getSessionUser(session);

  if (!user || !canManageUsers(user.role)) {
    redirect("/crm");
  }

  const tables = await getDatabaseOverview();
  const totalRows = tables.reduce((sum, table) => sum + table.count, 0);

  return (
    <>
      <CrmPageHeader
        title="Database"
        description={`Read-only browse of ${tables.length} tables · ${totalRows.toLocaleString()} total rows`}
      />
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider" }}
      >
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Table</TableCell>
              <TableCell align="right" sx={headerCellSx}>
                Rows
              </TableCell>
              <TableCell align="right" sx={{ ...headerCellSx, width: 72 }}>
                {" "}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tables.map((table) => (
              <TableRow
                key={table.key}
                hover
                sx={{
                  "&:last-child td": { borderBottom: 0 },
                }}
              >
                <TableCell>
                  <Link
                    href={`/crm/database/${table.key}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <Typography sx={{ fontWeight: 600 }}>
                      {table.label}
                    </Typography>
                  </Link>
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={table.count.toLocaleString()}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                      letterSpacing: 0,
                      textTransform: "none",
                      borderColor: "divider",
                      color: "text.primary",
                      backgroundColor: "background.default",
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title={`Browse ${table.label}`}>
                    <Link href={`/crm/database/${table.key}`}>
                      <IconButton
                        size="small"
                        aria-label={`Open ${table.label}`}
                      >
                        <ChevronRightOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Link>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
