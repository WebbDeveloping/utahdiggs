import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import MlsDraftDeleteButton from "@/components/account/MlsDraftDeleteButton";
import {
  formatMlsDraftProgress,
  formatMlsDraftSavedAt,
  getMlsDraftResumePath,
  isMlsDraft,
} from "@/lib/consumer/mls-draft";
import type { CustomerListingSummary } from "@/types/consumer-listing";

type MlsIntakeBannerProps = {
  listings: CustomerListingSummary[];
};

function MlsActions({
  listingId,
  hasDraft,
}: {
  listingId: string;
  hasDraft: boolean;
}) {
  return (
    <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
      <Link href={getMlsDraftResumePath(listingId)} style={{ textDecoration: "none" }}>
        <Button variant="contained" size="small" color="inherit" sx={{ whiteSpace: "nowrap" }}>
          {hasDraft ? "Continue MLS form" : "Start MLS form"}
        </Button>
      </Link>
      {hasDraft ? <MlsDraftDeleteButton listingId={listingId} size="small" /> : null}
    </Stack>
  );
}

function listingSubtitle(listing: CustomerListingSummary): string {
  if (isMlsDraft(listing)) {
    return `${formatMlsDraftProgress(listing.intakeCurrentStep)}${
      listing.intakeUpdatedAt
        ? ` · Last saved ${formatMlsDraftSavedAt(listing.intakeUpdatedAt)}`
        : ""
    }`;
  }
  return "Not started yet · About 20–25 minutes";
}

export default function MlsIntakeBanner({ listings }: MlsIntakeBannerProps) {
  if (listings.length === 0) return null;

  if (listings.length === 1) {
    const listing = listings[0]!;
    const hasDraft = isMlsDraft(listing);
    return (
      <Alert
        severity="warning"
        action={<MlsActions listingId={listing.id} hasDraft={hasDraft} />}
      >
        <AlertTitle>
          {hasDraft ? "MLS listing in progress" : "Finish your MLS listing intake"}
        </AlertTitle>
        <Typography variant="body2">
          {listing.address}, {listing.city} — {listingSubtitle(listing)}
        </Typography>
      </Alert>
    );
  }

  return (
    <Alert severity="warning">
      <AlertTitle>MLS listing intake needed</AlertTitle>
      <Stack spacing={1.5} sx={{ mt: 1 }}>
        {listings.map((listing) => {
          const hasDraft = isMlsDraft(listing);
          return (
            <Stack
              key={listing.id}
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
            >
              <Typography variant="body2">
                <strong>{listing.address}</strong>, {listing.city} — {listingSubtitle(listing)}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
              >
                <Link
                  href={getMlsDraftResumePath(listing.id)}
                  style={{ textDecoration: "none" }}
                >
                  <Button variant="outlined" size="small" color="inherit">
                    {hasDraft ? "Continue" : "Start"}
                  </Button>
                </Link>
                {hasDraft ? (
                  <MlsDraftDeleteButton listingId={listing.id} size="small" label="Discard" />
                ) : null}
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </Alert>
  );
}
