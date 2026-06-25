import type { Metadata } from "next";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import { IntakeStatus, ListingStatus } from "@/generated/prisma/client";
import SitePageLayout from "@/components/layout/SitePageLayout";
import ListingDashboardTabs from "@/components/account/listing-detail/ListingDashboardTabs";
import ListingPropertyHeader from "@/components/account/listing-detail/ListingPropertyHeader";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { getCustomerListingDetail } from "@/lib/consumer/listing-detail-query";
import { getMlsDraftResumePath, isMlsDraft } from "@/lib/consumer/mls-draft";
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
  const listing = await getCustomerListingDetail(user.id, id);

  if (!listing) {
    notFound();
  }

  if (listing.intakeStatus === IntakeStatus.DRAFT) {
    redirect(getMlsDraftResumePath(listing.id));
  }

  return (
    <SitePageLayout user={user}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={4}>
          <ListingPropertyHeader listing={listing} customerName={user.name} />

          {listing.status === ListingStatus.SUBMITTED ? (
            <Alert severity="info">
              Your listing is under review. Once approved and active on the MLS, you&apos;ll see
              offers, weekly updates, and seller requests here.
            </Alert>
          ) : null}

          <ListingDashboardTabs listing={listing} />
        </Stack>
      </Container>
    </SitePageLayout>
  );
}
