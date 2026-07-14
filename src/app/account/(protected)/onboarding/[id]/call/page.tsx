import type { Metadata } from "next";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import OnboardingCallForm from "@/components/account/onboarding/OnboardingCallForm";
import LinkButton from "@/components/ui/LinkButton";
import OnboardingStepLayout from "@/components/account/onboarding/OnboardingStepLayout";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { buildOnboardingPath } from "@/lib/consumer/onboarding";
import { getOnboardingListing } from "@/lib/consumer/onboarding-query";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Schedule your call — Glide RE",
};

type OnboardingCallPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OnboardingCallPage({ params }: OnboardingCallPageProps) {
  const user = await getConsumerSession();
  if (!user) return null;

  const { id } = await params;
  const listing = await getOnboardingListing(user.id, id);
  if (!listing) notFound();

  if (!listing.agreementSignedAt) {
    return (
      <OnboardingStepLayout user={user} listing={listing} title="Schedule your call">
        <Alert severity="warning">
          Please sign the listing agreement before scheduling your call.
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

  const actions = (
    <Stack direction="row" spacing={2}>
      <LinkButton href={buildOnboardingPath(listing.id)} color="inherit">
        Back to checklist
      </LinkButton>
      {listing.scheduledCallAt ? (
        <LinkButton
          href={`${buildOnboardingPath(listing.id)}/photos`}
          variant="contained"
        >
          Continue to photos
        </LinkButton>
      ) : null}
    </Stack>
  );

  return (
    <OnboardingStepLayout user={user} listing={listing} layout="shell">
      <OnboardingCallForm
        listingId={listing.id}
        address={listing.address}
        city={listing.city}
        title="Schedule your call"
        description="Pick a preferred time to connect with our team. We'll confirm by email."
        scheduledCallAt={listing.scheduledCallAt}
        callNotes={listing.callNotes}
        actions={actions}
      />
    </OnboardingStepLayout>
  );
}
