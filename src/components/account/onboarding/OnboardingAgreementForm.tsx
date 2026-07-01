"use client";

import { useActionState, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SignatureField from "@/components/account/mls-input/fields/SignatureField";
import { getListingAgreementContent } from "@/content/listing-agreement";
import { signListingAgreementAction } from "@/lib/consumer/onboarding-actions";
import type { OnboardingActionState } from "@/types/onboarding";
import type { ServicePlan } from "@/generated/prisma/client";
import type { BlobAccess } from "@/lib/storage/blob";

type OnboardingAgreementFormProps = {
  listingId: string;
  servicePlan: ServicePlan;
  agreementSignedAt: Date | null;
  signerName?: string;
  documentBlobAccess: BlobAccess;
};

export default function OnboardingAgreementForm({
  listingId,
  servicePlan,
  agreementSignedAt,
  signerName,
  documentBlobAccess,
}: OnboardingAgreementFormProps) {
  const content = getListingAgreementContent(servicePlan);
  const [signatureUrl, setSignatureUrl] = useState("");
  const [state, formAction, pending] = useActionState<OnboardingActionState, FormData>(
    signListingAgreementAction,
    {},
  );

  if (agreementSignedAt) {
    return (
      <Alert severity="success">
        Listing agreement signed on{" "}
        {agreementSignedAt.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
        .
      </Alert>
    );
  }

  return (
    <Box component="form" action={formAction}>
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="signatureUrl" value={signatureUrl} />
      <Stack spacing={3}>
        {state.error ? <Alert severity="error">{state.error}</Alert> : null}

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, maxHeight: 400, overflow: "auto" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {content.title}
          </Typography>
          <Stack spacing={2}>
            {content.sections.map((section) => (
              <Box key={section.heading}>
                <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{section.heading}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {section.body}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>

        <SignatureField
          label="Your signature"
          value={signatureUrl}
          listingId={listingId}
          signerName={signerName}
          documentBlobAccess={documentBlobAccess}
          required
          error={state.fieldErrors?.signatureUrl}
          onChange={setSignatureUrl}
        />

        <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
          <Button type="submit" variant="contained" disabled={pending || !signatureUrl}>
            {pending ? "Signing…" : "Sign agreement"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
