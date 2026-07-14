"use client";

import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildMlsInputDraftPath } from "@/lib/consumer/listing-prefill";

type MlsIntakePromptDialogProps = {
  listingId: string | null;
  address?: string | null;
};

export default function MlsIntakePromptDialog({
  listingId,
  address,
}: MlsIntakePromptDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(Boolean(listingId));

  useEffect(() => {
    setOpen(Boolean(listingId));
  }, [listingId]);

  const clearPromptParams = () => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("mlsPrompt");
    next.delete("listing");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const handleDismiss = () => {
    setOpen(false);
    clearPromptParams();
  };

  if (!listingId) return null;

  const mlsHref = buildMlsInputDraftPath(listingId);

  return (
    <Dialog open={open} onClose={handleDismiss} maxWidth="sm" fullWidth>
      <DialogTitle>Next up: MLS listing intake</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Plan on about 20–25 minutes. You can save and come back anytime.
        </Alert>
        <Typography>
          {address
            ? `You're almost done with onboarding for ${address}. Complete the MLS form so our team can get your listing live.`
            : "You're almost done with onboarding. Complete the MLS form so our team can get your listing live."}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDismiss} color="inherit">
          Later
        </Button>
        <Button
          component={Link}
          href={mlsHref}
          variant="contained"
          onClick={() => setOpen(false)}
        >
          Start MLS form
        </Button>
      </DialogActions>
    </Dialog>
  );
}
