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
import AccountEmptyState from "@/components/account/AccountEmptyState";
import { formatAccountDate } from "@/lib/consumer/format-date";
import { formatSellerRequestStatus } from "@/lib/crm/format";
import type { ConsumerSellerRequestRow } from "@/types/consumer-account-data";

type AccountSellerRequestsListProps = {
  requests: ConsumerSellerRequestRow[];
  multiListing: boolean;
};

export default function AccountSellerRequestsList({
  requests,
  multiListing,
}: AccountSellerRequestsListProps) {
  if (requests.length === 0) {
    return (
      <AccountEmptyState
        title="No seller requests yet"
        description="Requests you submit from your listing dashboard — price changes, open houses, messages to Blair — will appear here with status updates."
      />
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            {multiListing ? <TableCell>Property</TableCell> : null}
            <TableCell>Submitted</TableCell>
            <TableCell>Request</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              {multiListing ? (
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {request.listingAddress}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {request.listingCity}
                  </Typography>
                </TableCell>
              ) : null}
              <TableCell>{formatAccountDate(request.submittedAt)}</TableCell>
              <TableCell>
                {request.requestSummary ??
                  (request.updateTypes.length > 0 ? request.updateTypes.join(", ") : "—")}
              </TableCell>
              <TableCell>
                <Chip label={formatSellerRequestStatus(request.status)} size="small" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
