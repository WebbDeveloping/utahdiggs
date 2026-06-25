import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatCurrency } from "@/lib/crm/format";
import type { ConsumerListingOffer } from "@/types/consumer-listing-detail";

type ListingContractCardProps = {
  offer: ConsumerListingOffer;
};

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ListingContractCard({ offer }: ListingContractCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2,
        borderColor: "warning.main",
        borderLeft: 4,
        bgcolor: "warning.light",
      }}
    >
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Under contract
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              Contract price
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {formatCurrency(offer.contractPrice ?? offer.offerPrice)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              Settlement date
            </Typography>
            <Typography>{formatDate(offer.settlementDate)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              Seller concessions
            </Typography>
            <Typography>{offer.sellerConcessions ?? "—"}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              Buyer due diligence
            </Typography>
            <Typography>{formatDate(offer.buyerDueDiligenceDeadline)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              Appraisal deadline
            </Typography>
            <Typography>{formatDate(offer.financingAppraisalDeadline)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              Disclosure deadline
            </Typography>
            <Typography>{formatDate(offer.sellerDisclosureDeadline)}</Typography>
          </Grid>
          {offer.homeWarranty ? (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Home warranty
              </Typography>
              <Typography>{offer.homeWarranty}</Typography>
            </Grid>
          ) : null}
        </Grid>
      </Stack>
    </Paper>
  );
}
