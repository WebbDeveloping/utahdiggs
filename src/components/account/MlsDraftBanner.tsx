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
} from "@/lib/consumer/mls-draft";
import type { CustomerListingSummary } from "@/types/consumer-listing";

type MlsDraftBannerProps = {
  drafts: CustomerListingSummary[];
};

function DraftActions({ listingId }: { listingId: string }) {
  return (
    <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
      <Link href={getMlsDraftResumePath(listingId)} style={{ textDecoration: "none" }}>
        <Button variant="contained" size="small" color="inherit" sx={{ whiteSpace: "nowrap" }}>
          Continue MLS form
        </Button>
      </Link>
      <MlsDraftDeleteButton listingId={listingId} size="small" />
    </Stack>
  );
}

export default function MlsDraftBanner({ drafts }: MlsDraftBannerProps) {
  if (drafts.length === 0) return null;

  if (drafts.length === 1) {
    const draft = drafts[0];
    return (
      <Alert severity="info" action={<DraftActions listingId={draft.id} />}>
        <AlertTitle>MLS listing in progress</AlertTitle>
        <Typography variant="body2">
          {draft.address}, {draft.city} — {formatMlsDraftProgress(draft.intakeCurrentStep)}
          {draft.intakeUpdatedAt
            ? ` · Last saved ${formatMlsDraftSavedAt(draft.intakeUpdatedAt)}`
            : null}
        </Typography>
      </Alert>
    );
  }

  return (
    <Alert severity="info">
      <AlertTitle>MLS listings in progress</AlertTitle>
      <Stack spacing={1.5} sx={{ mt: 1 }}>
        {drafts.map((draft) => (
          <Stack
            key={draft.id}
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
          >
            <Typography variant="body2">
              <strong>{draft.address}</strong>, {draft.city} —{" "}
              {formatMlsDraftProgress(draft.intakeCurrentStep)}
              {draft.intakeUpdatedAt
                ? ` · Last saved ${formatMlsDraftSavedAt(draft.intakeUpdatedAt)}`
                : null}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}>
              <Link href={getMlsDraftResumePath(draft.id)} style={{ textDecoration: "none" }}>
                <Button variant="outlined" size="small" color="inherit">
                  Continue
                </Button>
              </Link>
              <MlsDraftDeleteButton listingId={draft.id} size="small" label="Discard" />
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Alert>
  );
}
