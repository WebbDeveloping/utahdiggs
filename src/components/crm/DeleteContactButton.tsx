"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import {
  deleteContactAction,
  getContactDeletePreviewAction,
  type ContactDeletePreview,
} from "@/lib/crm/contact-actions";
import { formatContactRole } from "@/lib/crm/contact-roles";
import { formatListingStatus } from "@/lib/crm/format";

type DeleteContactButtonProps = {
  contactId: string;
  contactName: string;
  contactEmail: string;
};

export default function DeleteContactButton({
  contactId,
  contactName,
  contactEmail,
}: DeleteContactButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<ContactDeletePreview | null>(null);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOpen() {
    setOpen(true);
    setConfirmEmail("");
    setError(null);
    setPreview(null);
    setLoadingPreview(true);

    const result = await getContactDeletePreviewAction(contactId);
    setLoadingPreview(false);

    if (result.error || !result.preview) {
      setError(result.error ?? "Failed to load delete preview.");
      return;
    }

    setPreview(result.preview);
  }

  function handleClose() {
    if (deleting) return;
    setOpen(false);
    setConfirmEmail("");
    setError(null);
    setPreview(null);
  }

  async function handleConfirm() {
    if (!preview) return;

    setDeleting(true);
    setError(null);

    const result = await deleteContactAction(contactId, confirmEmail);
    setDeleting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    router.push("/crm/contacts");
    router.refresh();
  }

  const emailMatches =
    confirmEmail.trim().toLowerCase() === contactEmail.toLowerCase();
  const canDelete = Boolean(preview) && emailMatches && !deleting && !loadingPreview;

  return (
    <>
      <Tooltip title="Delete contact">
        <IconButton
          size="small"
          color="error"
          aria-label={`Delete ${contactName}`}
          onClick={() => void handleOpen()}
        >
          <DeleteOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Delete contact permanently?</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            {loadingPreview ? (
              <DialogContentText>Loading related data…</DialogContentText>
            ) : preview ? (
              <>
                <DialogContentText>
                  This permanently deletes <strong>{contactName}</strong> (
                  {contactEmail}), their linked listings, and all uploaded
                  photos and documents for those listings. This cannot be
                  undone.
                </DialogContentText>

                <Stack spacing={0.75}>
                  <Typography variant="subtitle2">
                    Listings to delete ({preview.listings.length})
                  </Typography>
                  {preview.listings.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No linked listings.
                    </Typography>
                  ) : (
                    preview.listings.map((listing) => (
                      <Typography key={listing.id} variant="body2">
                        {listing.address}, {listing.city} —{" "}
                        {formatListingStatus(listing.status)} (
                        {formatContactRole(listing.role)})
                      </Typography>
                    ))
                  )}
                </Stack>

                <Stack spacing={0.5}>
                  <Typography variant="subtitle2">Files to delete</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {preview.photoCount + preview.documentCount === 0
                      ? "No listing photos or documents."
                      : `${preview.photoCount} photo${preview.photoCount === 1 ? "" : "s"} and ${preview.documentCount} document${preview.documentCount === 1 ? "" : "s"} will be permanently removed from storage.`}
                  </Typography>
                </Stack>

                <Stack spacing={0.5}>
                  <Typography variant="subtitle2">Seller account</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {preview.customer
                      ? `Will delete portal login${preview.customer.name ? ` for ${preview.customer.name}` : ""} (${contactEmail}).`
                      : "No matching seller portal account."}
                  </Typography>
                </Stack>

                <TextField
                  label="Type email to confirm"
                  placeholder={contactEmail}
                  value={confirmEmail}
                  onChange={(event) => setConfirmEmail(event.target.value)}
                  size="small"
                  fullWidth
                  autoComplete="off"
                  disabled={deleting}
                />
              </>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={deleting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={!canDelete}
            onClick={() => void handleConfirm()}
          >
            {deleting ? "Deleting…" : "Delete permanently"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
