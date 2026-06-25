"use client";

import { useState, useTransition } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useRouter } from "next/navigation";
import { deleteMlsDraftAction } from "@/lib/mls-input/delete-draft-action";

type MlsDraftDeleteButtonProps = {
  listingId: string;
  label?: string;
  size?: "small" | "medium";
  variant?: "text" | "outlined";
  color?: "inherit" | "error";
  redirectTo?: string;
};

export default function MlsDraftDeleteButton({
  listingId,
  label = "Discard draft",
  size = "small",
  variant = "outlined",
  color = "inherit",
  redirectTo,
}: MlsDraftDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleOpen() {
    setError(null);
    setOpen(true);
  }

  function handleClose() {
    if (!pending) setOpen(false);
  }

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteMlsDraftAction(listingId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        color={color}
        onClick={handleOpen}
        disabled={pending}
        sx={{ whiteSpace: "nowrap" }}
      >
        {label}
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Discard this draft?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete your saved MLS form progress. You can start
            a new listing anytime, but this draft cannot be recovered.
          </DialogContentText>
          {error ? (
            <DialogContentText color="error" sx={{ mt: 2 }}>
              {error}
            </DialogContentText>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="error" variant="contained" disabled={pending}>
            {pending ? "Discarding…" : "Discard draft"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
