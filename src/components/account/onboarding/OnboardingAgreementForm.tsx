"use client";

import { useActionState, useCallback, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SignatureField from "@/components/account/mls-input/fields/SignatureField";
import { ESIGN_CONSENT_TEXT } from "@/content/esign-consent";
import { getListingAgreementContent } from "@/content/listing-agreement";
import { signListingAgreementAction } from "@/lib/consumer/onboarding-actions";
import type { OnboardingActionState } from "@/types/onboarding";
import type { ServicePlan } from "@/generated/prisma/client";
import type { BlobAccess } from "@/lib/storage/blob";

type SignatureMode = "draw" | "type";

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
  const [esignConsent, setEsignConsent] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState<SignatureMode>("draw");
  const [auditSignerName, setAuditSignerName] = useState(signerName?.trim() ?? "");
  const [state, formAction, pending] = useActionState<OnboardingActionState, FormData>(
    signListingAgreementAction,
    {},
  );

  const handleSignerNameChange = useCallback((name: string) => {
    setAuditSignerName(name.trim());
  }, []);

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

  const canSubmit = esignConsent && Boolean(signatureUrl) && auditSignerName.length >= 2;

  return (
    <Box component="form" action={formAction}>
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="signatureUrl" value={signatureUrl} />
      <input type="hidden" name="signatureMethod" value={signatureMethod} />
      <input type="hidden" name="signerName" value={auditSignerName} />
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
          onModeChange={setSignatureMethod}
          onSignerNameChange={handleSignerNameChange}
        />

        <Box>
          <FormControlLabel
            control={
              <Checkbox
                name="esignConsent"
                checked={esignConsent}
                onChange={(event) => setEsignConsent(event.target.checked)}
                required
              />
            }
            label={
              <Typography variant="body2" component="span" sx={{ whiteSpace: "pre-line" }}>
                {ESIGN_CONSENT_TEXT}
              </Typography>
            }
            sx={{ alignItems: "flex-start", mx: 0 }}
          />
          {state.fieldErrors?.esignConsent ? (
            <FormHelperText error sx={{ mx: 0 }}>
              {state.fieldErrors.esignConsent}
            </FormHelperText>
          ) : null}
        </Box>

        <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
          <Button type="submit" variant="contained" disabled={pending || !canSubmit}>
            {pending ? "Signing…" : "Sign agreement"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
