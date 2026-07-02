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
import type { ConsumerShowingRow } from "@/types/consumer-account-data";

type AccountShowingsListProps = {
  showings: ConsumerShowingRow[];
  multiListing: boolean;
};

export default function AccountShowingsList({
  showings,
  multiListing,
}: AccountShowingsListProps) {
  if (showings.length === 0) {
    return (
      <AccountEmptyState
        title="No showings yet"
        description="When buyer's agents schedule showings for your listing, they'll appear here with agent details and feedback."
      />
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            {multiListing ? <TableCell>Property</TableCell> : null}
            <TableCell>Date</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Buyer&apos;s agent</TableCell>
            <TableCell>Feedback</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {showings.map((showing) => (
            <TableRow key={showing.id}>
              {multiListing ? (
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {showing.listingAddress}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {showing.listingCity}
                  </Typography>
                </TableCell>
              ) : null}
              <TableCell>{formatAccountDate(showing.showingDate)}</TableCell>
              <TableCell>{showing.showingTime ?? showing.showingLabel ?? "—"}</TableCell>
              <TableCell>{showing.buyersAgent ?? "—"}</TableCell>
              <TableCell sx={{ maxWidth: 320 }}>
                {showing.feedback ? (
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {showing.feedback}
                  </Typography>
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
