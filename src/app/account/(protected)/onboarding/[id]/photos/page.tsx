import type { Metadata } from "next";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import OnboardingPhotoForm from "@/components/account/onboarding/OnboardingPhotoForm";
import LinkButton from "@/components/ui/LinkButton";
import OnboardingStepLayout from "@/components/account/onboarding/OnboardingStepLayout";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import {
  buildOnboardingPath,
  onboardingStatusIndex,
} from "@/lib/consumer/onboarding";
import { getOnboardingListing } from "@/lib/consumer/onboarding-query";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Add photos — Glide RE",
};

type OnboardingPhotosPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OnboardingPhotosPage({ params }: OnboardingPhotosPageProps) {
  const user = await getConsumerSession();
  if (!user) return null;

  const { id } = await params;
  const listing = await getOnboardingListing(user.id, id);
  if (!listing) notFound();

  const photosComplete =
    onboardingStatusIndex(listing.onboardingStatus) >=
    onboardingStatusIndex("CALL_PENDING");

  if (!listing.agreementSignedAt) {
    return (
      <OnboardingStepLayout user={user} listing={listing} title="Add photos">
        <Alert severity="warning">
          Please sign the listing agreement before uploading photos.
        </Alert>
        <LinkButton
          href={`${buildOnboardingPath(listing.id)}/agreement`}
          variant="contained"
        >
          Sign agreement
        </LinkButton>
      </OnboardingStepLayout>
    );
  }

  return (
    <OnboardingStepLayout
      user={user}
      listing={listing}
      title="Add photos"
      description="Upload listing photos or request a professional photo tour."
    >
      <OnboardingPhotoForm
        listingId={listing.id}
        servicePlan={listing.servicePlan}
        proPhotoTourRequested={listing.proPhotoTourRequested}
        photosComplete={photosComplete}
      />
      <Stack direction="row" spacing={2}>
        <LinkButton href={buildOnboardingPath(listing.id)} color="inherit">
          Back to checklist
        </LinkButton>
        {photosComplete ? (
          <LinkButton
            href={`${buildOnboardingPath(listing.id)}/call`}
            variant="contained"
          >
            Continue to call scheduling
          </LinkButton>
        ) : null}
      </Stack>
    </OnboardingStepLayout>
  );
}
