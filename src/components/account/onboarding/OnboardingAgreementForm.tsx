"use client";

import { useActionState, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RightToSellAgreementDocument from "@/components/account/onboarding/RightToSellAgreementDocument";
import { ESIGN_CONSENT_TEXT } from "@/content/esign-consent";
import { buildListingDocumentsPath } from "@/lib/consumer/listing-documents-path";
import { buildOnboardingPath } from "@/lib/consumer/onboarding";
import { signListingAgreementAction } from "@/lib/consumer/onboarding-actions";
import { buildDefaultUarAgreementFormValues } from "@/lib/signature/uar-agreement-schema";
import { buildAccountDocumentHref } from "@/lib/storage/document-access";
import type { OnboardingActionState } from "@/types/onboarding";
import type { ServicePlan } from "@/generated/prisma/client";
import type { BlobAccess } from "@/lib/storage/blob";
import type { UarAgreementFormValues } from "@/types/uar-agreement";

type OnboardingAgreementFormProps = {
  listingId: string;
  servicePlan: ServicePlan;
  agreementSignedAt: Date | null;
  signedAgreementDocumentId?: string | null;
  listing: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  sellerEmail: string;
  sellerPhone?: string;
  sellerFirstName?: string;
  sellerLastName?: string;
  documentBlobAccess: BlobAccess;
};

export default function OnboardingAgreementForm({
  listingId,
  agreementSignedAt,
  signedAgreementDocumentId,
  listing,
  sellerEmail,
  sellerPhone,
  sellerFirstName,
  sellerLastName,
  documentBlobAccess,
}: OnboardingAgreementFormProps) {
  const [form, setForm] = useState<UarAgreementFormValues>(() =>
    buildDefaultUarAgreementFormValues({
      ...listing,
      sellerEmail,
      sellerPhone,
      sellerFirstName,
      sellerLastName,
    }),
  );
  const [esignConsent, setEsignConsent] = useState(false);
  const [state, formAction, pending] = useActionState<OnboardingActionState, FormData>(
    signListingAgreementAction,
    {},
  );

  const updateField = <K extends keyof UarAgreementFormValues>(
    key: K,
    value: UarAgreementFormValues[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleSqFtSource = (source: string, checked: boolean) => {
    setForm((current) => ({
      ...current,
      sqFtSources: checked
        ? [...current.sqFtSources, source]
        : current.sqFtSources.filter((item) => item !== source),
    }));
  };

  if (agreementSignedAt) {
    return (
      <Stack spacing={2}>
        <Alert severity="success">
          Listing agreement signed on{" "}
          {agreementSignedAt.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
          .
        </Alert>
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
          {signedAgreementDocumentId ? (
            <>
              <Link
                href={buildAccountDocumentHref(listingId, signedAgreementDocumentId, "view")}
                target="_blank"
                rel="noopener noreferrer"
              >
                View signed agreement
              </Link>
              <Link
                href={buildAccountDocumentHref(listingId, signedAgreementDocumentId, "download")}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download
              </Link>
            </>
          ) : null}
          <Link href={buildListingDocumentsPath(listingId)}>All documents</Link>
        </Stack>
      </Stack>
    );
  }

  const showSeller2 = form.multipleOwners === "YES";
  const canSubmit =
    esignConsent &&
    Boolean(form.seller1SignatureUrl) &&
    Boolean(form.seller1InitialsUrl) &&
    form.seller1FirstName.trim().length > 0 &&
    form.seller1LastName.trim().length > 0 &&
    (!showSeller2 ||
      (form.seller2FirstName.trim().length > 0 &&
        form.seller2LastName.trim().length > 0 &&
        form.seller2Email.trim().length > 0 &&
        form.seller2Phone.trim().length > 0 &&
        Boolean(form.seller2SignatureUrl) &&
        Boolean(form.seller2InitialsUrl)));

  return (
    <Box component="form" action={formAction}>
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="seller1SignatureUrl" value={form.seller1SignatureUrl} />
      <input type="hidden" name="seller1InitialsUrl" value={form.seller1InitialsUrl} />
      <input type="hidden" name="seller2SignatureUrl" value={form.seller2SignatureUrl} />
      <input type="hidden" name="seller2InitialsUrl" value={form.seller2InitialsUrl} />
      <input type="hidden" name="signatureMethod" value={form.signatureMethod} />
      <input type="hidden" name="signedDate" value={form.signedDate} />
      <input type="hidden" name="disputeMediation" value={form.disputeMediation} />
      <input type="hidden" name="attachmentTerms" value={form.attachmentTerms} />
      <input type="hidden" name="firptaStatus" value={form.firptaStatus} />

      <Stack spacing={3}>
        {state.error ? <Alert severity="error">{state.error}</Alert> : null}

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
          <RightToSellAgreementDocument
            listingId={listingId}
            form={form}
            fieldErrors={state.fieldErrors}
            documentBlobAccess={documentBlobAccess}
            onUpdateField={updateField}
            onToggleSqFtSource={toggleSqFtSource}
          />

          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: "divider" }}>
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
        </Paper>

        <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Button
            component="a"
            href={`${buildOnboardingPath(listingId)}/agreement/preview`}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            disabled={pending}
          >
            Preview official PDF
          </Button>
          <Button type="submit" variant="contained" disabled={pending || !canSubmit}>
            {pending ? "Signing…" : "Sign agreement"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
