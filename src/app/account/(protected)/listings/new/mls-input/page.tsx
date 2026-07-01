import type { Metadata } from "next";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SitePageLayout from "@/components/layout/SitePageLayout";
import LinkButton from "@/components/ui/LinkButton";
import MlsDraftChooser from "@/components/account/mls-input/MlsDraftChooser";
import MlsInputWizard from "@/components/account/mls-input/MlsInputWizard";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { buildOnboardingPathForListing } from "@/lib/consumer/listing-prefill";
import { getMlsDrafts } from "@/lib/consumer/mls-draft";
import { getCustomerListings } from "@/lib/consumer/listings-query";
import { onboardingStatusIndex } from "@/lib/consumer/onboarding";
import { prisma } from "@/lib/db";
import { IntakeStatus } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "MLS listing intake — Glide RE",
};

type MlsInputPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function buildInitialDataFromListing(listing: {
  address: string;
  city: string;
  state: string;
  zip: string;
}): Record<string, unknown> {
  return {
    listingAddress: {
      street: listing.address,
      city: listing.city,
      state: listing.state,
      zip: listing.zip,
    },
  };
}

async function ensureListingIntake(listingId: string, listing: {
  address: string;
  city: string;
  state: string;
  zip: string;
}) {
  const existing = await prisma.listingIntake.findUnique({
    where: { listingId },
  });
  if (existing) return existing;

  return prisma.listingIntake.create({
    data: {
      listingId,
      status: IntakeStatus.DRAFT,
      currentStep: 1,
      data: buildInitialDataFromListing(listing) as Prisma.InputJsonValue,
    },
  });
}

export default async function MlsInputPage({ searchParams }: MlsInputPageProps) {
  const user = await getConsumerSession();
  if (!user) return null;

  const customer = await prisma.customer.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, phone: true },
  });
  if (!customer) return null;

  const params = await searchParams;
  const draftId = getParam(params.draft);

  if (!draftId) {
    redirect("/account/listings");
  }

  const listing = await prisma.listing.findFirst({
    where: { id: draftId, customerId: user.id },
    include: { listingIntake: true },
  });

  if (!listing) {
    redirect("/account/listings");
  }

  const mlsReady =
    onboardingStatusIndex(listing.onboardingStatus) >=
    onboardingStatusIndex("MLS_INTAKE_PENDING");

  if (!mlsReady) {
    return (
      <SitePageLayout user={user}>
        <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
          <Stack spacing={3}>
            <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
              MLS listing intake
            </Typography>
            <Alert severity="warning">
              Complete the onboarding steps (plan, agreement, photos, and call scheduling)
              before starting the MLS intake form.
            </Alert>
            <LinkButton
              href={buildOnboardingPathForListing(listing.id)}
              variant="contained"
            >
              Back to onboarding
            </LinkButton>
          </Stack>
        </Container>
      </SitePageLayout>
    );
  }

  if (listing.listingIntake?.status === IntakeStatus.SUBMITTED) {
    redirect(buildOnboardingPathForListing(listing.id));
  }

  const intake =
    listing.listingIntake ??
    (await ensureListingIntake(listing.id, listing));

  const data = (intake.data as Record<string, unknown>) ?? buildInitialDataFromListing(listing);

  return (
    <SitePageLayout user={user}>
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={4}>
          <Stack spacing={1}>
            <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
              MLS listing intake
            </Typography>
            <Typography color="text.secondary">
              Complete the full MLS listing form for WFRMLS submission. Plan on 20–25
              minutes. You can save and return at any time.
            </Typography>
          </Stack>
          <MlsInputWizard
            user={customer}
            draftListingId={listing.id}
            initialStep={intake.currentStep}
            initialData={data}
            initialValues={{
              address: listing.address,
              city: listing.city,
              state: listing.state,
              zip: listing.zip,
            }}
          />
        </Stack>
      </Container>
    </SitePageLayout>
  );
}
