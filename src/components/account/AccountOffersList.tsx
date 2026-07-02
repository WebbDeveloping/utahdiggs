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
import { formatOfferVsList } from "@/lib/consumer/listing-stats";
import { formatAccountDate } from "@/lib/consumer/format-date";
import {
  formatCurrency,
  formatOfferStatus,
  offerStatusColor,
} from "@/lib/crm/format";
import type { ConsumerOfferRow } from "@/types/consumer-account-data";

type AccountOffersListProps = {
  offers: ConsumerOfferRow[];
  multiListing: boolean;
};

export default function AccountOffersList({ offers, multiListing }: AccountOffersListProps) {
  if (offers.length === 0) {
    return (
      <AccountEmptyState
        title="No offers yet"
        description="When buyer's agents submit offers on your listing, they'll appear here with price, status, and agent details."
      />
    );
  }

  const pendingOffers = offers.filter((offer) => offer.status === "PENDING_REVIEW");

  return (
    <Stack spacing={3}>
      {pendingOffers.length > 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 2,
            borderColor: "warning.main",
            borderLeft: 4,
          }}
        >
          <Stack spacing={1}>
            <Chip label="Pending review" color="warning" size="small" sx={{ alignSelf: "flex-start" }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {formatCurrency(pendingOffers[0].offerPrice)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {pendingOffers[0].listingAddress} · {pendingOffers[0].buyersAgent ?? "Buyer's agent"} ·{" "}
              {formatAccountDate(pendingOffers[0].submittedDate)}
            </Typography>
          </Stack>
        </Paper>
      ) : null}

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              {multiListing ? <TableCell>Property</TableCell> : null}
              <TableCell>Offer price</TableCell>
              <TableCell>Buyer&apos;s agent</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">vs list</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {offers.map((offer) => (
              <TableRow key={offer.id}>
                {multiListing ? (
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {offer.listingAddress}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {offer.listingCity}
                    </Typography>
                  </TableCell>
                ) : null}
                <TableCell>{formatCurrency(offer.offerPrice)}</TableCell>
                <TableCell>{offer.buyersAgent ?? "—"}</TableCell>
                <TableCell>{formatAccountDate(offer.submittedDate)}</TableCell>
                <TableCell>
                  <Chip
                    label={formatOfferStatus(offer.status)}
                    color={offerStatusColor(offer.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {formatOfferVsList(offer.offerPrice, offer.listPrice)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
