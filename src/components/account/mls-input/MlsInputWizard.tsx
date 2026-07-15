"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { saveMlsDraftAction } from "@/lib/mls-input/save-draft-action";
import { submitMlsIntakeAction } from "@/lib/mls-input/submit-action";
import {
  buildDataFormPreviewPath,
  mlsDataFormPreviewStorageKey,
} from "@/lib/mls-input/data-form-preview-storage";
import {
  MLS_INPUT_STEP_COUNT,
  MLS_INPUT_STEPS,
} from "@/lib/mls-input/schema";
import type { MlsInputWizardProps } from "@/lib/mls-input/types";
import MlsInputProgress from "./MlsInputProgress";
import MlsInputStepView from "./MlsInputStep";
import MlsDraftDeleteButton from "@/components/account/MlsDraftDeleteButton";
import { buildListingDocumentsPath } from "@/lib/consumer/listing-documents-path";
import { LISTING_INTAKE_PATH } from "@/lib/consumer/listing-prefill";

function buildInitialValues(
  user: MlsInputWizardProps["user"],
  initialValues?: MlsInputWizardProps["initialValues"],
  initialData?: Record<string, unknown>,
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    ...(initialData ?? {}),
  };

  if (initialValues?.inquiryId) {
    base.inquiryId = initialValues.inquiryId;
  }

  if (initialValues?.listingAddress || initialValues?.address) {
    const existing = (base.listingAddress as Record<string, string>) ?? {};
    base.listingAddress = {
      street: initialValues.listingAddress?.street ?? initialValues.address ?? existing.street ?? "",
      city: initialValues.listingAddress?.city ?? initialValues.city ?? existing.city ?? "",
      state: initialValues.listingAddress?.state ?? initialValues.state ?? existing.state ?? "UT",
      zip: initialValues.listingAddress?.zip ?? initialValues.zip ?? existing.zip ?? "",
    };
  }

  if (!base.primaryOwnerEmail && user.email) {
    base.primaryOwnerEmail = user.email;
  }
  if (!base.primaryOwnerPhone && user.phone) {
    base.primaryOwnerPhone = user.phone;
  }
  if (!base.primaryOwnerName && user.name) {
    const parts = user.name.trim().split(/\s+/);
    base.primaryOwnerName = {
      first: parts[0] ?? "",
      last: parts.slice(1).join(" "),
    };
  }

  return base;
}

export default function MlsInputWizard({
  user,
  initialValues,
  draftListingId,
  initialStep = 1,
  initialData,
}: MlsInputWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [listingId, setListingId] = useState<string | undefined>(draftListingId);
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    buildInitialValues(user, initialValues, initialData),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [draftPending, startDraftTransition] = useTransition();
  const [submitPending, startSubmitTransition] = useTransition();
  const [previewPending, setPreviewPending] = useState(false);
  const skipStepScrollRef = useRef(true);

  const step = MLS_INPUT_STEPS[currentStep - 1];
  const isLastStep = currentStep === MLS_INPUT_STEP_COUNT;

  const fieldErrorIds = Object.keys(fieldErrors);
  const missingFieldLabels =
    step && fieldErrorIds.length > 0
      ? step.fields
          .filter((field) => fieldErrorIds.includes(field.id))
          .map((field) => field.label ?? field.id)
      : [];

  useEffect(() => {
    if (skipStepScrollRef.current) {
      skipStepScrollRef.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  useEffect(() => {
    const errorIds = Object.keys(fieldErrors);
    if (!step || errorIds.length === 0) return;

    const firstErrorFieldId = step.fields.find((field) => errorIds.includes(field.id))?.id;
    if (!firstErrorFieldId) return;

    const container = document.getElementById(`mls-field-${firstErrorFieldId}`);
    if (!container) return;

    container.scrollIntoView({ behavior: "smooth", block: "center" });
    const focusable = container.querySelector<HTMLElement>(
      'input:not([type="hidden"]), textarea, select, button, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus({ preventScroll: true });
  }, [fieldErrors, step]);

  const handleChange = useCallback((fieldId: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setFieldErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }, []);

  const runSave = useCallback(
    (nextStep: number, onSuccess?: (savedListingId?: string) => void) => {
      setError(null);
      const formData = new FormData();
      if (listingId) formData.set("listingId", listingId);
      formData.set("currentStep", String(currentStep));
      formData.set("nextStep", String(nextStep));
      formData.set("values", JSON.stringify(values));

      startDraftTransition(async () => {
        const result = await saveMlsDraftAction({}, formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
          return;
        }
        if (result.listingId) setListingId(result.listingId);
        setFieldErrors({});
        onSuccess?.(result.listingId);
      });
    },
    [currentStep, listingId, values],
  );

  const handleNext = () => {
    if (isLastStep) return;
    runSave(currentStep + 1, () => setCurrentStep((s) => s + 1));
  };

  const handleBack = () => {
    setFieldErrors({});
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  const handleSaveLater = () => {
    runSave(currentStep, () => {
      router.push("/account?draftSaved=1");
    });
  };

  const ensureDraftSaved = useCallback(async (): Promise<string | null> => {
    let activeListingId = listingId;

    if (!activeListingId) {
      const formData = new FormData();
      formData.set("currentStep", String(currentStep));
      formData.set("nextStep", String(currentStep));
      formData.set("values", JSON.stringify(values));
      const saveResult = await saveMlsDraftAction({}, formData);
      if (saveResult.error) {
        setError(saveResult.error);
        return null;
      }
      if (saveResult.fieldErrors) {
        setFieldErrors(saveResult.fieldErrors);
        return null;
      }
      if (!saveResult.listingId) {
        setError("Failed to save draft.");
        return null;
      }
      activeListingId = saveResult.listingId;
      setListingId(activeListingId);
      return activeListingId;
    }

    const formData = new FormData();
    formData.set("listingId", activeListingId);
    formData.set("currentStep", String(currentStep));
    formData.set("nextStep", String(currentStep));
    formData.set("values", JSON.stringify(values));
    const saveResult = await saveMlsDraftAction({}, formData);
    if (saveResult.error) {
      setError(saveResult.error);
      return null;
    }
    if (saveResult.fieldErrors) {
      setFieldErrors(saveResult.fieldErrors);
      return null;
    }
    if (saveResult.listingId) {
      activeListingId = saveResult.listingId;
      setListingId(activeListingId);
    }
    return activeListingId;
  }, [currentStep, listingId, values]);

  const handlePreviewDataForm = () => {
    setError(null);
    setFieldErrors({});
    setPreviewPending(true);

    void (async () => {
      try {
        const activeListingId = await ensureDraftSaved();
        if (!activeListingId) return;

        sessionStorage.setItem(
          mlsDataFormPreviewStorageKey(activeListingId),
          JSON.stringify(values),
        );
        router.push(buildDataFormPreviewPath(activeListingId));
      } finally {
        setPreviewPending(false);
      }
    })();
  };

  const handleSubmit = async () => {
    setError(null);
    setFieldErrors({});

    let activeListingId = listingId;

    if (!activeListingId) {
      const formData = new FormData();
      formData.set("currentStep", String(currentStep));
      formData.set("nextStep", String(currentStep));
      formData.set("values", JSON.stringify(values));
      const saveResult = await saveMlsDraftAction({}, formData);
      if (saveResult.error) {
        setError(saveResult.error);
        return;
      }
      if (saveResult.fieldErrors) {
        setFieldErrors(saveResult.fieldErrors);
        return;
      }
      if (!saveResult.listingId) {
        setError("Failed to save draft before submit.");
        return;
      }
      activeListingId = saveResult.listingId;
      setListingId(activeListingId);
    }

    const formData = new FormData();
    formData.set("listingId", activeListingId);
    formData.set("values", JSON.stringify(values));

    startSubmitTransition(async () => {
      const result = await submitMlsIntakeAction({}, formData);
      if (result.error) setError(result.error);
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
    });
  };

  if (!step) return null;

  return (
    <Stack spacing={3}>
      <MlsInputProgress currentStep={currentStep} />

      <Paper
        elevation={0}
        sx={{ p: { xs: 2.5, sm: 3 }, border: "1px solid", borderColor: "divider" }}
      >
        <MlsInputStepView
          step={step}
          values={values}
          fieldErrors={fieldErrors}
          onChange={handleChange}
        />
      </Paper>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          position: "sticky",
          bottom: 0,
          py: 2,
          bgcolor: "background.default",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        {missingFieldLabels.length > 0 ? (
          <Typography variant="body2" color="error" role="alert">
            Please fix: {missingFieldLabels.join(", ")}
          </Typography>
        ) : null}

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={1}>
            {listingId ? (
              <Button
                component={NextLink}
                href={buildListingDocumentsPath(listingId)}
                variant="text"
                color="inherit"
              >
                Listing agreement
              </Button>
            ) : null}
            <Button
              component={NextLink}
              href={LISTING_INTAKE_PATH}
              variant="text"
              color="inherit"
            >
              Simple form
            </Button>
            <Button
              variant="outlined"
              onClick={handleSaveLater}
              disabled={draftPending || submitPending || previewPending}
            >
              {draftPending ? "Saving…" : "Save & continue later"}
            </Button>
            {listingId ? (
              <MlsDraftDeleteButton
                listingId={listingId}
                label="Discard draft"
                redirectTo="/account/listings/new/mls-input?new=1"
              />
            ) : null}
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={currentStep === 1 || draftPending || submitPending || previewPending}
            >
              Back
            </Button>
            {isLastStep ? (
              <>
                <Button
                  variant="outlined"
                  onClick={handlePreviewDataForm}
                  disabled={draftPending || submitPending || previewPending}
                >
                  {previewPending ? "Preparing…" : "View official form"}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => void handleSubmit()}
                  disabled={draftPending || submitPending || previewPending}
                >
                  {submitPending ? "Submitting…" : "Submit listing"}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={draftPending || submitPending || previewPending}
              >
                {draftPending ? "Saving…" : "Next"}
              </Button>
            )}
          </Stack>
        </Box>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
        Plan on 20–25 minutes to complete this form. Your progress is saved as you go.
      </Typography>
    </Stack>
  );
}
