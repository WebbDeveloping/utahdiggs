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
  MLS_INPUT_STEP_COUNT,
  MLS_INPUT_STEPS,
} from "@/lib/mls-input/schema";
import type { MlsInputWizardProps } from "@/lib/mls-input/types";
import MlsInputProgress from "./MlsInputProgress";
import MlsInputStepView from "./MlsInputStep";
import MlsDraftDeleteButton from "@/components/account/MlsDraftDeleteButton";

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
  const skipStepScrollRef = useRef(true);

  const step = MLS_INPUT_STEPS[currentStep - 1];
  const isLastStep = currentStep === MLS_INPUT_STEP_COUNT;

  useEffect(() => {
    if (skipStepScrollRef.current) {
      skipStepScrollRef.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

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
          flexWrap: "wrap",
          gap: 1.5,
          justifyContent: "space-between",
          position: "sticky",
          bottom: 0,
          py: 2,
          bgcolor: "background.default",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" spacing={1}>
          <Button
            component={NextLink}
            href="/account/listings/new"
            variant="text"
            color="inherit"
          >
            Simple form
          </Button>
          <Button
            variant="outlined"
            onClick={handleSaveLater}
            disabled={draftPending || submitPending}
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
            disabled={currentStep === 1 || draftPending || submitPending}
          >
            Back
          </Button>
          {isLastStep ? (
            <Button
              variant="contained"
              onClick={() => void handleSubmit()}
              disabled={draftPending || submitPending}
            >
              {submitPending ? "Submitting…" : "Submit listing"}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={draftPending || submitPending}
            >
              {draftPending ? "Saving…" : "Next"}
            </Button>
          )}
        </Stack>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
        Plan on 20–25 minutes to complete this form. Your progress is saved as you go.
      </Typography>
    </Stack>
  );
}
