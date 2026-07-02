import type { Metadata } from "next";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SitePageLayout from "@/components/layout/SitePageLayout";
import LinkButton from "@/components/ui/LinkButton";
import OnboardingChecklist from "@/components/account/onboarding/OnboardingChecklist";
import OnboardingExpectations from "@/components/account/onboarding/OnboardingExpectations";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import {
  buildOnboardingPath,
  formatServicePlan,
  isOnboardingInProgress,
} from "@/lib/consumer/onboarding";
import { buildListingDocumentsPath } from "@/lib/consumer/listing-documents-path";
import { getOnboardingListing } from "@/lib/consumer/onboarding-query";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Listing onboarding — Glide RE",
};

type OnboardingHubPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ submitted?: string }>;
};

export default async function OnboardingHubPage({
  params,
  searchParams,
}: OnboardingHubPageProps) {
  const user = await getConsumerSession();
  if (!user) return null;

  const { id } = await params;
  const { submitted } = await searchParams;
  const listing = await getOnboardingListing(user.id, id);
  if (!listing) notFound();

  const inProgress = isOnboardingInProgress(listing);

  return (
    <SitePageLayout user={user}>
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={4}>
          <Stack spacing={1}>
            <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
              Get your home listed
            </Typography>
            <Typography color="text.secondary">
              {listing.address}, {listing.city}, {listing.state}
              {listing.servicePlan ? ` · ${formatServicePlan(listing.servicePlan)}` : ""}
            </Typography>
          </Stack>

          {submitted || listing.submittedAt ? (
            <Alert severity="success">
              Your MLS intake has been submitted and is under review. We&apos;ll notify you
              when your listing goes live.
            </Alert>
          ) : inProgress ? (
            <Alert severity="info">
              Complete each step below to get your home on the MLS. You can save progress
              and return anytime.
            </Alert>
          ) : null}

          <OnboardingChecklist listing={listing} />

          <Stack spacing={2}>
            <Typography variant="h6">What to expect</Typography>
            <OnboardingExpectations />
          </Stack>

          <Stack direction="row" spacing={2}>
            <LinkButton href="/account/listings" color="inherit">
              My listings
            </LinkButton>
            {listing.agreementSignedAt ? (
              <LinkButton href={buildListingDocumentsPath(listing.id)} variant="outlined">
                View documents
              </LinkButton>
            ) : null}
            {listing.submittedAt ? (
              <LinkButton href={`/account/listings/${listing.id}`} variant="outlined">
                View dashboard
              </LinkButton>
            ) : null}
          </Stack>
        </Stack>
      </Container>
    </SitePageLayout>
  );
}
