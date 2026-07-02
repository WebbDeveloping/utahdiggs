import type { Metadata } from "next";
import Stack from "@mui/material/Stack";
import OnboardingPlanForm from "@/components/account/onboarding/OnboardingPlanForm";
import LinkButton from "@/components/ui/LinkButton";
import OnboardingStepLayout from "@/components/account/onboarding/OnboardingStepLayout";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { buildOnboardingPath } from "@/lib/consumer/onboarding";
import { getOnboardingListing } from "@/lib/consumer/onboarding-query";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Choose your plan — Glide RE",
};

type OnboardingPlanPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OnboardingPlanPage({
  params,
}: OnboardingPlanPageProps) {
  const user = await getConsumerSession();
  if (!user) return null;

  const { id } = await params;
  const listing = await getOnboardingListing(user.id, id);
  if (!listing) notFound();

  return (
    <OnboardingStepLayout
      user={user}
      listing={listing}
      title="Choose your plan"
      description="Select Virtual or Full Service. You can review details on each plan before continuing."
    >
      <OnboardingPlanForm
        listingId={listing.id}
        currentPlan={listing.servicePlan}
      />
      <Stack direction="row" spacing={2}>
        <LinkButton href={buildOnboardingPath(listing.id)} color="inherit">
          Back to checklist
        </LinkButton>
        {listing.servicePlan ? (
          <LinkButton
            href={`${buildOnboardingPath(listing.id)}/agreement`}
            variant="contained"
          >
            Continue to agreement
          </LinkButton>
        ) : null}
      </Stack>
    </OnboardingStepLayout>
  );
}
