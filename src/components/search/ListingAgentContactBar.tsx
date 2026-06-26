"use client";

import { FormEvent, useActionState, useState } from "react";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  submitListingInquiryAction,
  type ListingInquiryState,
} from "@/lib/consumer/listing-inquiry-actions";
import type { ListingInquiryType } from "@/lib/consumer/listing-inquiry-validation";
import type { PublicListingAgent, PublicListingDetail } from "@/types/public-listing";
import PhoneTextField from "@/components/ui/PhoneTextField";

type InquiryModalType = ListingInquiryType | null;

type ListingAgentContactBarProps = {
  listing: PublicListingDetail;
};

function getAgentInitials(agent: PublicListingAgent): string {
  if (agent.name?.trim()) {
    const parts = agent.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  return agent.email.slice(0, 2).toUpperCase();
}

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "background.default",
  },
};

function ListingInquiryDialog({
  open,
  type,
  listing,
  onClose,
}: {
  open: boolean;
  type: ListingInquiryType;
  listing: PublicListingDetail;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<ListingInquiryState, FormData>(
    submitListingInquiryAction,
    {},
  );

  const title = type === "tour" ? "Schedule a Tour" : "Request Info";
  const subtitle =
    type === "tour"
      ? `Tell us when you'd like to see ${listing.address}.`
      : `Ask a question about ${listing.address}.`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formAction(formData);
  }

  return (
    <Dialog open={open} onClose={() => !pending && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <input type="hidden" name="listingId" value={listing.id} />
        <input type="hidden" name="type" value={type} />
        <DialogContent>
          <Stack spacing={2.5}>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>

            {state.error ? <Alert severity="error">{state.error}</Alert> : null}
            {state.success ? (
              <Alert severity="success">Thanks — we&apos;ll be in touch shortly.</Alert>
            ) : (
              <>
                <TextField
                  name="name"
                  label="Name"
                  required
                  fullWidth
                  error={Boolean(state.fieldErrors?.name)}
                  helperText={state.fieldErrors?.name}
                  sx={inputSx}
                />
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  required
                  fullWidth
                  error={Boolean(state.fieldErrors?.email)}
                  helperText={state.fieldErrors?.email}
                  sx={inputSx}
                />
                <PhoneTextField
                  name="phone"
                  label="Phone"
                  required
                  fullWidth
                  error={Boolean(state.fieldErrors?.phone)}
                  helperText={state.fieldErrors?.phone}
                  sx={inputSx}
                />
                {type === "tour" ? (
                  <TextField
                    name="preferredDate"
                    label="Preferred date"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={inputSx}
                  />
                ) : null}
                <TextField
                  name="message"
                  label={type === "tour" ? "Message (optional)" : "Your question"}
                  required={type === "info"}
                  fullWidth
                  multiline
                  minRows={3}
                  error={Boolean(state.fieldErrors?.message)}
                  helperText={state.fieldErrors?.message}
                  sx={inputSx}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={pending}>
            {state.success ? "Close" : "Cancel"}
          </Button>
          {!state.success ? (
            <Button type="submit" variant="contained" disabled={pending}>
              {pending ? "Sending…" : "Submit"}
            </Button>
          ) : null}
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function ListingAgentContactBar({ listing }: ListingAgentContactBarProps) {
  const [modalType, setModalType] = useState<InquiryModalType>(null);
  const agent = listing.assignedAgent;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        {agent ? (
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", minWidth: 0 }}>
            <Avatar
              src={agent.image ?? undefined}
              alt={agent.name ?? agent.email}
              sx={{
                width: 56,
                height: 56,
                bgcolor: "primary.main",
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              {getAgentInitials(agent)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                {agent.name ?? "Listing agent"}
              </Typography>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mt: 0.5 }}>
                <EmailOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                <Link
                  href={`mailto:${agent.email}`}
                  underline="hover"
                  color="text.secondary"
                  sx={{ fontSize: 14, wordBreak: "break-all" }}
                >
                  {agent.email}
                </Link>
              </Stack>
            </Box>
          </Stack>
        ) : (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Interested in this home?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Reach out to schedule a showing or ask a question.
            </Typography>
          </Box>
        )}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ flexShrink: 0, width: { xs: "100%", sm: "auto" } }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={() => setModalType("tour")}
            sx={{ minWidth: { sm: 160 } }}
          >
            Schedule a Tour
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => setModalType("info")}
            sx={{ minWidth: { sm: 140 } }}
          >
            Request Info
          </Button>
        </Stack>
      </Box>

      {modalType ? (
        <ListingInquiryDialog
          open
          type={modalType}
          listing={listing}
          onClose={() => setModalType(null)}
        />
      ) : null}
    </>
  );
}
