import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
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

type MlsDraftChooserProps = {
  drafts: CustomerListingSummary[];
  newListingHref?: string;
};

export default function MlsDraftChooser({
  drafts,
  newListingHref = "/account/listings/new/mls-input?new=1",
}: MlsDraftChooserProps) {
  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h6">Continue a saved MLS listing?</Typography>
        <Typography variant="body2" color="text.secondary">
          You have {drafts.length === 1 ? "a saved draft" : `${drafts.length} saved drafts`}.
          Pick one to continue, start a new listing, or discard a draft you no longer need.
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {drafts.map((draft) => (
          <Paper key={draft.id} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
            >
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{draft.address}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {draft.city}, {draft.state} · {formatMlsDraftProgress(draft.intakeCurrentStep)}
                </Typography>
                {draft.intakeUpdatedAt ? (
                  <Typography variant="caption" color="text.secondary">
                    Last saved {formatMlsDraftSavedAt(draft.intakeUpdatedAt)}
                  </Typography>
                ) : null}
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                <Link href={getMlsDraftResumePath(draft.id)} style={{ textDecoration: "none" }}>
                  <Button variant="contained">Continue</Button>
                </Link>
                <MlsDraftDeleteButton listingId={draft.id} label="Discard" />
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Box>
        <Link href={newListingHref} style={{ textDecoration: "none" }}>
          <Button variant="outlined">Start a new listing</Button>
        </Link>
      </Box>
    </Stack>
  );
}
