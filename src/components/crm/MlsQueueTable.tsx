import Link from "next/link";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import CrmApproveListingButton from "@/components/crm/CrmApproveListingButton";
import type { MlsQueueListing } from "@/lib/crm/mls-queue-queries";

type MlsQueueTableProps = {
  listings: MlsQueueListing[];
};

function formatSubmittedAt(value: Date | null): string {
  if (!value) {
    return "—";
  }
  return value.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MlsQueueTable({ listings }: MlsQueueTableProps) {
  if (listings.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          border: "1px dashed",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Queue is clear
        </Typography>
        <Typography color="text.secondary">
          When a seller submits the MLS intake form, it will appear here for Matrix
          entry and approval.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: "1px solid", borderColor: "divider" }}
    >
      <Table size="medium">
        <TableHead>
          <TableRow>
            <TableCell>Submitted</TableCell>
            <TableCell>Property</TableCell>
            <TableCell>Seller</TableCell>
            <TableCell>Assigned agent</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {listings.map((listing) => {
            const submitted =
              listing.intakeSubmittedAt ?? listing.submittedAt;
            const agentLabel =
              listing.assignedAgent?.name?.trim() ||
              listing.assignedAgent?.email ||
              "Unassigned";

            return (
              <TableRow key={listing.id} hover>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {formatSubmittedAt(submitted)}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/crm/listings/${listing.id}?tab=intake`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <Typography sx={{ fontWeight: 600 }}>
                      {listing.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {listing.city}, {listing.state}
                    </Typography>
                  </Link>
                </TableCell>
                <TableCell>{listing.sellerName}</TableCell>
                <TableCell>{agentLabel}</TableCell>
                <TableCell align="right">
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: "flex-end", flexWrap: "wrap" }}
                  >
                    <Button
                      href={`/crm/listings/${listing.id}?tab=intake`}
                      size="small"
                      variant="outlined"
                    >
                      Open intake
                    </Button>
                    <CrmApproveListingButton
                      listingId={listing.id}
                      address={listing.address}
                      listingSlug={listing.listingSlug}
                    />
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
