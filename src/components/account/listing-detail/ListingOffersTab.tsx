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
import { formatOfferVsList } from "@/lib/consumer/listing-stats";
import {
  formatCurrency,
  formatOfferStatus,
  offerStatusColor,
} from "@/lib/crm/format";
import type { ConsumerListingOffer } from "@/types/consumer-listing-detail";

type ListingOffersTabProps = {
  offers: ConsumerListingOffer[];
  listPrice: string | null;
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function averageOfferPrice(offers: ConsumerListingOffer[]): number | null {
  const prices = offers
    .map((o) => (o.offerPrice ? Number(o.offerPrice) : NaN))
    .filter((n) => !Number.isNaN(n));
  if (prices.length === 0) return null;
  return prices.reduce((sum, n) => sum + n, 0) / prices.length;
}

export default function ListingOffersTab({ offers, listPrice }: ListingOffersTabProps) {
  if (offers.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
        <Typography color="text.secondary">
          No offers yet — when buyer&apos;s agents submit offers, they&apos;ll appear here.
        </Typography>
      </Paper>
    );
  }

  const pendingOffers = offers.filter((o) => o.status === "PENDING_REVIEW");
  const avgPrice = averageOfferPrice(offers);
  const latestOffer = offers[0];

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
              {pendingOffers[0].buyersAgent ?? "Buyer's agent"} ·{" "}
              {formatDate(pendingOffers[0].submittedDate)} ·{" "}
              {formatOfferVsList(pendingOffers[0].offerPrice, listPrice)} vs list
            </Typography>
          </Stack>
        </Paper>
      ) : null}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
        <BoxStat label="Total offers" value={String(offers.length)} />
        <BoxStat label="Avg offer price" value={formatCurrency(avgPrice)} />
        <BoxStat
          label="Last offer"
          value={
            latestOffer
              ? `${formatDate(latestOffer.submittedDate)}${latestOffer.buyersAgent ? ` · ${latestOffer.buyersAgent}` : ""}`
              : "—"
          }
        />
      </Stack>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
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
                <TableCell>{formatCurrency(offer.offerPrice)}</TableCell>
                <TableCell>{offer.buyersAgent ?? "—"}</TableCell>
                <TableCell>{formatDate(offer.submittedDate)}</TableCell>
                <TableCell>
                  <Chip
                    label={formatOfferStatus(offer.status)}
                    color={offerStatusColor(offer.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {formatOfferVsList(offer.offerPrice, listPrice)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

function BoxStat({ label, value }: { label: string; value: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, flex: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600 }}>{value}</Typography>
    </Paper>
  );
}
