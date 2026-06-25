"use client";

import { useTransition } from "react";
import Button from "@mui/material/Button";
import { approveListingAction } from "@/lib/crm/listing-actions";

type CrmApproveListingButtonProps = {
  listingId: string;
};

export default function CrmApproveListingButton({
  listingId,
}: CrmApproveListingButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="small"
      variant="contained"
      color="success"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await approveListingAction(listingId);
        });
      }}
    >
      {pending ? "Approving…" : "Approve"}
    </Button>
  );
}
