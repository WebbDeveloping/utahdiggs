"use client";

import { useActionState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { selectServicePlanAction } from "@/lib/consumer/onboarding-actions";
import type { OnboardingActionState } from "@/types/onboarding";
import type { ServicePlan } from "@/generated/prisma/client";

const plans = [
  {
    id: "VIRTUAL" as const,
    name: "Virtual",
    rate: "1%",
    pitch: "Everything you need to list and sell yourself, guided by our team the whole way.",
    features: [
      "Listed on the MLS for maximum exposure",
      "Syndicated to Zillow, Redfin, Realtor.com & more",
      "Professional yard sign & listing photos coordination",
      "Pricing & comparable-sales report",
      "Offer management & e-sign paperwork",
      "Phone & chat support from licensed agents",
    ],
    finePrint: "Listing fee is 1% of the final sale price or $4,500, whichever is greater.",
  },
  {
    id: "FULL_SERVICE" as const,
    name: "Full Service",
    rate: "1.5%",
    pitch: "Everything in Virtual, plus in-person help to get your home market-ready.",
    features: [
      "Everything in Virtual, plus:",
      "Staging consultation to maximize appeal",
      "On-site visit from one of our agents",
      "Secure MLS lock box",
      "Professional photo tour included",
    ],
    finePrint: "Listing fee is 1.5% of the final sale price or $4,500, whichever is greater.",
    featured: true,
  },
];

type OnboardingPlanFormProps = {
  listingId: string;
  currentPlan: ServicePlan | null;
};

export default function OnboardingPlanForm({
  listingId,
  currentPlan,
}: OnboardingPlanFormProps) {
  const [state, formAction, pending] = useActionState<OnboardingActionState, FormData>(
    selectServicePlanAction,
    {},
  );

  const selectedPlan = currentPlan ?? null;

  return (
    <Box component="form" action={formAction}>
      <input type="hidden" name="listingId" value={listingId} />
      <Stack spacing={3}>
        {selectedPlan ? (
          <Alert severity="success" icon={<CheckCircleOutlinedIcon />}>
            You selected the{" "}
            <strong>{plans.find((p) => p.id === selectedPlan)?.name ?? selectedPlan}</strong>{" "}
            plan. Choose a different plan below if you need to change it.
          </Alert>
        ) : null}
        {state.error ? <Alert severity="error">{state.error}</Alert> : null}
        {state.fieldErrors?.servicePlan ? (
          <Alert severity="error">{state.fieldErrors.servicePlan}</Alert>
        ) : null}

        <Stack direction="row" spacing={2} sx={{ alignItems: "stretch" }}>
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;

            return (
            <Paper
              key={plan.id}
              variant="outlined"
              sx={{
                flex: 1,
                p: 2.5,
                borderRadius: 2,
                borderColor: isSelected || plan.featured ? "primary.main" : "divider",
                borderWidth: isSelected ? 2 : 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Stack spacing={2} sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "baseline" }}>
                  <Typography variant="h6">{plan.name}</Typography>
                  <Typography color="primary.main" sx={{ fontWeight: 700 }}>
                    {plan.rate}
                  </Typography>
                </Stack>
                <Typography color="text.secondary">{plan.pitch}</Typography>
                <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
                  {plan.features.map((feature) => (
                    <Typography key={feature} component="li" variant="body2">
                      {feature}
                    </Typography>
                  ))}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {plan.finePrint}
                </Typography>
                <Button
                  type="submit"
                  name="servicePlan"
                  value={plan.id}
                  variant={isSelected || plan.featured ? "contained" : "outlined"}
                  disabled={pending || isSelected}
                  sx={{ mt: "auto" }}
                >
                  {pending
                    ? "Saving…"
                    : isSelected
                      ? "Selected"
                      : selectedPlan
                        ? `Switch to ${plan.name}`
                        : `Choose ${plan.name}`}
                </Button>
              </Stack>
            </Paper>
            );
          })}
        </Stack>
      </Stack>
    </Box>
  );
}
