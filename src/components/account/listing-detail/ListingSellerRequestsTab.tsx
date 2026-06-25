"use client";

import { useActionState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ClosingTeamCards from "@/components/account/listing-detail/ClosingTeamCards";
import {
  submitDescriptionUpdateAction,
  submitMessageBlairAction,
  submitOpenHouseRequestAction,
  type SellerRequestFormState,
} from "@/lib/consumer/seller-request-actions";
import type { ConsumerListingDetail } from "@/types/consumer-listing-detail";

type ListingSellerRequestsTabProps = {
  listing: Pick<
    ConsumerListingDetail,
    "id" | "escrowOfficer" | "transactionCoordinator"
  >;
};

const initialState: SellerRequestFormState = {};

function RequestFormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
        {children}
      </Stack>
    </Paper>
  );
}

function DescriptionForm({ listingId }: { listingId: string }) {
  const [state, action, pending] = useActionState(
    submitDescriptionUpdateAction,
    initialState,
  );

  return (
    <RequestFormSection
      title="Update description / remarks"
      description="Suggest changes to your MLS description or marketing remarks."
    >
      <Box component="form" action={action}>
        <input type="hidden" name="listingId" value={listingId} />
        <Stack spacing={2}>
          <TextField
            name="message"
            label="What would you like updated?"
            multiline
            minRows={4}
            required
            fullWidth
          />
          {state.error ? <Alert severity="error">{state.error}</Alert> : null}
          {state.success ? (
            <Alert severity="success">Description update sent to Blair.</Alert>
          ) : null}
          <Button type="submit" variant="contained" disabled={pending}>
            {pending ? "Sending…" : "Send request"}
          </Button>
        </Stack>
      </Box>
    </RequestFormSection>
  );
}

function OpenHouseForm({ listingId }: { listingId: string }) {
  const [state, action, pending] = useActionState(
    submitOpenHouseRequestAction,
    initialState,
  );

  return (
    <RequestFormSection
      title="Request an open house"
      description="Pick a preferred date and time. Blair will confirm availability."
    >
      <Box component="form" action={action}>
        <input type="hidden" name="listingId" value={listingId} />
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="openHouseDate"
                label="Date"
                type="date"
                required
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="openHouseTime"
                label="Preferred time"
                placeholder="e.g. 11:00 AM – 1:00 PM"
                fullWidth
              />
            </Grid>
          </Grid>
          {state.error ? <Alert severity="error">{state.error}</Alert> : null}
          {state.success ? (
            <Alert severity="success">Open house request sent to Blair.</Alert>
          ) : null}
          <Button type="submit" variant="contained" disabled={pending}>
            {pending ? "Sending…" : "Send request"}
          </Button>
        </Stack>
      </Box>
    </RequestFormSection>
  );
}

function MessageForm({ listingId }: { listingId: string }) {
  const [state, action, pending] = useActionState(submitMessageBlairAction, initialState);

  return (
    <RequestFormSection
      title="Send Blair a message"
      description="Questions, concerns, or anything else on your mind."
    >
      <Box component="form" action={action}>
        <input type="hidden" name="listingId" value={listingId} />
        <Stack spacing={2}>
          <TextField
            name="message"
            label="Your message"
            multiline
            minRows={4}
            required
            fullWidth
          />
          {state.error ? <Alert severity="error">{state.error}</Alert> : null}
          {state.success ? <Alert severity="success">Message sent to Blair.</Alert> : null}
          <Button type="submit" variant="contained" disabled={pending}>
            {pending ? "Sending…" : "Send message"}
          </Button>
        </Stack>
      </Box>
    </RequestFormSection>
  );
}

export default function ListingSellerRequestsTab({ listing }: ListingSellerRequestsTabProps) {
  return (
    <Stack spacing={3}>
      <DescriptionForm listingId={listing.id} />
      <OpenHouseForm listingId={listing.id} />
      <MessageForm listingId={listing.id} />
      <ClosingTeamCards
        escrowOfficer={listing.escrowOfficer}
        transactionCoordinator={listing.transactionCoordinator}
      />
    </Stack>
  );
}
