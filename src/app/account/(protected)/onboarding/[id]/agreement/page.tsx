import type { Metadata } from "next";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import OnboardingAgreementForm from "@/components/account/onboarding/OnboardingAgreementForm";
import LinkButton from "@/components/ui/LinkButton";
import OnboardingStepLayout from "@/components/account/onboarding/OnboardingStepLayout";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { buildOnboardingPath } from "@/lib/consumer/onboarding";
import { getOnboardingListing } from "@/lib/consumer/onboarding-query";
import { getServerDocumentBlobAccess } from "@/lib/storage/blob";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign listing agreement — Glide RE",
};

type OnboardingAgreementPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OnboardingAgreementPage({
  params,
}: OnboardingAgreementPageProps) {
  const user = await getConsumerSession();
  if (!user) return null;

  const { id } = await params;
  const listing = await getOnboardingListing(user.id, id);
  if (!listing) notFound();

  if (!listing.servicePlan) {
    return (
      <OnboardingStepLayout
        user={user}
        listing={listing}
        title="Sign listing agreement"
      >
        <Alert severity="warning">
          Please choose a plan before signing the listing agreement.
        </Alert>
        <LinkButton href={`${buildOnboardingPath(listing.id)}/plan`} variant="contained">
          Choose plan
        </LinkButton>
      </OnboardingStepLayout>
    );
  }

  return (
    <OnboardingStepLayout
      user={user}
      listing={listing}
      title="Sign listing agreement"
      description="Review the agreement below and sign to continue."
    >
      <OnboardingAgreementForm
        listingId={listing.id}
        servicePlan={listing.servicePlan}
        agreementSignedAt={listing.agreementSignedAt}
        signerName={user.name ?? undefined}
        documentBlobAccess={getServerDocumentBlobAccess()}
      />
      <Stack direction="row" spacing={2}>
        <LinkButton href={buildOnboardingPath(listing.id)} color="inherit">
          Back to checklist
        </LinkButton>
        {listing.agreementSignedAt ? (
          <LinkButton
            href={`${buildOnboardingPath(listing.id)}/photos`}
            variant="contained"
          >
            Continue to photos
          </LinkButton>
        ) : null}
      </Stack>
    </OnboardingStepLayout>
  );
}
