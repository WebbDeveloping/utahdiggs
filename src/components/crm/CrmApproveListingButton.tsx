"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { approveListingAction } from "@/lib/crm/listing-actions";

const CHECKLIST_ITEMS = [
  {
    id: "details",
    label: "Listing details match intake (address, beds, baths, sqft)",
  },
  {
    id: "photos",
    label: "Photos meet MLS minimum (2 exterior + 3 interior)",
  },
  {
    id: "remarks",
    label: "Public remarks reviewed",
  },
  {
    id: "identity",
    label: "Owner identity verified (manual / Zoom)",
  },
  {
    id: "matrix",
    label: "Entered and live in Matrix",
  },
] as const;

type ChecklistId = (typeof CHECKLIST_ITEMS)[number]["id"];

type CrmApproveListingButtonProps = {
  listingId: string;
  address: string;
  listingSlug: string;
  photoCount?: number;
  beds?: string | null;
  baths?: string | null;
  sqft?: string | null;
  sellerName?: string | null;
};

function emptyChecklist(): Record<ChecklistId, boolean> {
  return {
    details: false,
    photos: false,
    remarks: false,
    identity: false,
    matrix: false,
  };
}

export default function CrmApproveListingButton({
  listingId,
  address,
  listingSlug,
  photoCount = 0,
  beds = null,
  baths = null,
  sqft = null,
  sellerName = null,
}: CrmApproveListingButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mlsNumber, setMlsNumber] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checklist, setChecklist] = useState(emptyChecklist);

  const trimmedMls = mlsNumber.trim();
  const allChecked = CHECKLIST_ITEMS.every((item) => checklist[item.id]);

  const facts = [
    beds ? `${beds} bed` : null,
    baths ? `${baths} bath` : null,
    sqft ? `${sqft} sqft` : null,
    `${photoCount} photo${photoCount === 1 ? "" : "s"}`,
  ].filter(Boolean);

  const resetAndClose = () => {
    if (pending) return;
    setOpen(false);
    setMlsNumber("");
    setError(null);
    setChecklist(emptyChecklist());
  };

  const handleApprove = async () => {
    if (!trimmedMls) {
      setError("MLS number is required.");
      return;
    }
    if (!allChecked) {
      setError("Complete the review checklist before approving.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await approveListingAction(listingId, trimmedMls);
      setOpen(false);
      setMlsNumber("");
      setChecklist(emptyChecklist());
      router.refresh();
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

      <Dialog open={open} onClose={resetAndClose} maxWidth="md" fullWidth>
        <DialogTitle>Approve listing</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography>
              Approve <strong>{address}</strong> and make it live on Glide RE search?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {[sellerName ? `Seller: ${sellerName}` : null, facts.join(" · ")]
                .filter(Boolean)
                .join(" · ")}
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Review checklist
            </Typography>
            <FormGroup>
              {CHECKLIST_ITEMS.map((item) => (
                <FormControlLabel
                  key={item.id}
                  control={
                    <Checkbox
                      checked={checklist[item.id]}
                      onChange={(e) =>
                        setChecklist((prev) => ({
                          ...prev,
                          [item.id]: e.target.checked,
                        }))
                      }
                      disabled={pending}
                    />
                  }
                  label={item.label}
                />
              ))}
            </FormGroup>

            <TextField
              label="MLS number"
              value={mlsNumber}
              onChange={(e) => setMlsNumber(e.target.value)}
              placeholder="Enter after WFRMLS Matrix entry"
              required
              fullWidth
            />
            <Alert severity="info">
              Listing slug: <strong>{listingSlug}</strong>. The seller will receive a welcome
              email with a link to sign in at <strong>/login</strong>.
            </Alert>
            {error ? <Alert severity="error">{error}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetAndClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleApprove}
            disabled={pending || !trimmedMls || !allChecked}
          >
            {pending ? "Approving…" : "Approve & go live"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
