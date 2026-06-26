import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { daysOnMarket } from "@/lib/consumer/listing-stats";
import type { PublicListing } from "@/types/public-listing";

type ListingMlsComplianceProps = {
  listing: PublicListing;
};

function formatListDate(listDate: string | null): string | null {
  if (!listDate) return null;
  const date = new Date(`${listDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ListingMlsCompliance({ listing }: ListingMlsComplianceProps) {
  const formattedListDate = formatListDate(listing.listDate);
  const dom =
    listing.listDate != null
      ? daysOnMarket(new Date(`${listing.listDate}T00:00:00`))
      : null;

  const hasContent =
    listing.listingOffice ||
    listing.mlsNumber ||
    formattedListDate ||
    dom != null;

  if (!hasContent) return null;

  return (
    <Stack
      spacing={0.5}
      sx={{
        pt: 2,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      {listing.listingOffice ? (
        <>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Listing Office:
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {listing.listingOffice}
          </Typography>
        </>
      ) : null}

      {listing.mlsNumber ? (
        <>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, pt: 1 }}>
            MLS:
          </Typography>
          <Typography variant="caption" color="text.secondary">
            #{listing.mlsNumber}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            UtahRealEstate
          </Typography>
        </>
      ) : null}

      {formattedListDate ? (
        <Typography variant="caption" color="text.secondary" sx={{ pt: 1 }}>
          Date Listed: {formattedListDate}
        </Typography>
      ) : null}

      {dom != null ? (
        <Typography variant="caption" color="text.secondary">
          Days on Market: {dom}
        </Typography>
      ) : null}
    </Stack>
  );
}
