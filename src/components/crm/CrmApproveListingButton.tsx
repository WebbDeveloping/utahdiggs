"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { approveListingAction } from "@/lib/crm/listing-actions";

type CrmApproveListingButtonProps = {
  listingId: string;
  address: string;
  portalSlug: string;
};

export default function CrmApproveListingButton({
  listingId,
  address,
  portalSlug,
}: CrmApproveListingButtonProps) {
  const [open, setOpen] = useState(false);
  const [mlsNumber, setMlsNumber] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setPending(true);
    setError(null);
    try {
      await approveListingAction(listingId, mlsNumber.trim() || undefined);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve listing.");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button size="small" variant="contained" color="success" onClick={() => setOpen(true)}>
        Approve
      </Button>

      <Dialog open={open} onClose={() => !pending && setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve listing</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography>
              Approve <strong>{address}</strong> and make it live on Utah Digs search?
            </Typography>
            <TextField
              label="MLS number (optional)"
              value={mlsNumber}
              onChange={(e) => setMlsNumber(e.target.value)}
              placeholder="Enter after WFRMLS Matrix entry"
              fullWidth
            />
            <Alert severity="info">
              Portal slug: <strong>{portalSlug}</strong>. Seller PIN is the last 4 digits of
              their phone on file. A welcome email will be sent if Resend is configured.
            </Alert>
            {error ? <Alert severity="error">{error}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="contained" color="success" onClick={handleApprove} disabled={pending}>
            {pending ? "Approving…" : "Approve & go live"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
