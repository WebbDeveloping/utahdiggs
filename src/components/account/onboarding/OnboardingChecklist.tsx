"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinkButton from "@/components/ui/LinkButton";
import {
  ONBOARDING_STEPS,
  isStepAccessible,
  isStepComplete,
  onboardingProgressPercent,
  type OnboardingStepId,
} from "@/lib/consumer/onboarding";
import type { OnboardingListingDetail } from "@/types/onboarding";

type OnboardingChecklistProps = {
  listing: OnboardingListingDetail;
};

export default function OnboardingChecklist({ listing }: OnboardingChecklistProps) {
  const progress = onboardingProgressPercent(listing);

  return (
    <Stack spacing={3}>
      <Box>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Onboarding progress
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {progress}%
          </Typography>
        </Stack>
        <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 1, height: 8 }} />
      </Box>

      <Stack spacing={1.5}>
        {ONBOARDING_STEPS.map((step) => {
          const complete = isStepComplete(listing, step.id);
          const accessible = isStepAccessible(listing, step);
          const isCurrent = !complete && accessible && step.required;

          return (
            <StepCard
              key={step.id}
              stepId={step.id}
              order={step.order}
              title={step.title}
              description={step.description}
              href={step.href(listing.id)}
              complete={complete}
              accessible={accessible}
              isCurrent={isCurrent}
              required={step.required}
            />
          );
        })}
      </Stack>
    </Stack>
  );
}

function StepCard({
  stepId,
  order,
  title,
  description,
  href,
  complete,
  accessible,
  isCurrent,
  required,
}: {
  stepId: OnboardingStepId;
  order: number;
  title: string;
  description: string;
  href: string;
  complete: boolean;
  accessible: boolean;
  isCurrent: boolean;
  required: boolean;
}) {
  const useHashLink = stepId === "expectations";

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        borderColor: isCurrent ? "primary.main" : "divider",
        opacity: accessible || complete ? 1 : 0.65,
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
        <Box sx={{ pt: 0.25, color: complete ? "success.main" : "text.secondary" }}>
          {complete ? (
            <CheckCircleIcon fontSize="small" color="success" />
          ) : (
            <RadioButtonUncheckedIcon fontSize="small" />
          )}
        </Box>

        <Stack spacing={0.5} sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <Typography sx={{ fontWeight: 600 }}>
              {order}. {title}
            </Typography>
            {complete ? (
              <Chip label="Complete" size="small" color="success" variant="outlined" />
            ) : isCurrent ? (
              <Chip label="Current step" size="small" color="primary" />
            ) : !required ? (
              <Chip label="Optional" size="small" variant="outlined" />
            ) : null}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Stack>

        {accessible && !complete && required ? (
          useHashLink ? (
            <Button component="a" href={href} size="small" variant="outlined">
              View
            </Button>
          ) : (
            <LinkButton href={href} size="small" variant={isCurrent ? "contained" : "outlined"}>
              {stepId === "mls" ? "Start" : "Continue"}
            </LinkButton>
          )
        ) : complete && stepId !== "expectations" ? (
          <LinkButton href={href} size="small" variant="text">
            Review
          </LinkButton>
        ) : null}
      </Stack>
    </Paper>
  );
}
