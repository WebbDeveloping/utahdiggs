import type { Metadata } from "next";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { IntakeStatus, ListingStatus } from "@/generated/prisma/client";
import ListingDashboardTabs from "@/components/account/listing-detail/ListingDashboardTabs";
import ListingPropertyHeader from "@/components/account/listing-detail/ListingPropertyHeader";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { isOnboardingInProgress } from "@/lib/consumer/onboarding";
import { buildOnboardingPathForListing } from "@/lib/consumer/listing-prefill";
import { getCustomerListingDetail } from "@/lib/consumer/listing-detail-query";
import { getListingOverviewMetrics } from "@/lib/consumer/listing-overview-metrics";
import { getMlsDraftResumePath } from "@/lib/consumer/mls-draft";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Listing dashboard — Glide RE",
};

type AccountListingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AccountListingDetailPage({
  params,
}: AccountListingDetailPageProps) {
  const user = await getConsumerSession();
  if (!user) {
    return null;
  }

  const { id } = await params;
  const [listing, metrics] = await Promise.all([
    getCustomerListingDetail(user.id, id),
    getListingOverviewMetrics(user.id, id),
  ]);

  if (!listing) {
    notFound();
  }

  if (listing.intakeStatus === IntakeStatus.DRAFT) {
    redirect(getMlsDraftResumePath(listing.id));
  }

  if (isOnboardingInProgress(listing)) {
    redirect(buildOnboardingPathForListing(listing.id));
  }

  return (
    <Stack spacing={4}>
      <ListingPropertyHeader
        listing={listing}
        metrics={metrics}
        customerName={user.name}
      />

      {listing.status === ListingStatus.SUBMITTED && listing.submittedAt ? (
        <Alert severity="info">
          Your listing is under review. Once approved and active on the MLS, you&apos;ll see
          offers, weekly updates, and seller requests here.{" "}
          <a href={buildOnboardingPathForListing(listing.id)}>View onboarding status</a>
        </Alert>
      ) : null}

      <ListingDashboardTabs listing={listing} />
    </Stack>
  );
}
