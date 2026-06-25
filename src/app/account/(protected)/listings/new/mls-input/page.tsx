import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SitePageLayout from "@/components/layout/SitePageLayout";
import MlsDraftChooser from "@/components/account/mls-input/MlsDraftChooser";
import MlsInputWizard from "@/components/account/mls-input/MlsInputWizard";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { getMlsDrafts } from "@/lib/consumer/mls-draft";
import { getCustomerListings } from "@/lib/consumer/listings-query";
import { parseListingPrefillFromSearchParams } from "@/lib/consumer/listing-prefill";
import { prisma } from "@/lib/db";
import { IntakeStatus, SellInquiryStatus } from "@/generated/prisma/client";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "MLS listing intake — Glide RE",
};

type MlsInputPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function buildNewListingPath(
  params: Record<string, string | string[] | undefined>,
): string {
  const preserved = new URLSearchParams();
  preserved.set("new", "1");

  for (const key of ["address", "city", "state", "zip", "inquiryId"] as const) {
    const value = getParam(params[key]);
    if (value) preserved.set(key, value);
  }

  return `/account/listings/new/mls-input?${preserved.toString()}`;
}

export default async function MlsInputPage({ searchParams }: MlsInputPageProps) {
  const user = await getConsumerSession();
  if (!user) {
    return null;
  }

  const customer = await prisma.customer.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, phone: true },
  });

  if (!customer) {
    return null;
  }

  const params = await searchParams;
  const draftId = getParam(params.draft);
  const startNew = getParam(params.new) === "1";
  const prefill = parseListingPrefillFromSearchParams(params);

  if (draftId) {
    const draft = await prisma.listing.findFirst({
      where: { id: draftId, customerId: user.id },
      include: { listingIntake: true },
    });

    if (!draft?.listingIntake) {
      redirect("/account/listings/new/mls-input");
    }

    if (draft.listingIntake.status === IntakeStatus.SUBMITTED) {
      redirect(`/account/listings?submitted=${encodeURIComponent(draft.portalSlug)}`);
    }

    const data = (draft.listingIntake.data as Record<string, unknown>) ?? {};

    return (
      <SitePageLayout user={user}>
        <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
          <Stack spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
                MLS listing intake
              </Typography>
              <Typography color="text.secondary">
                Continue your saved MLS listing form.
              </Typography>
            </Stack>
            <MlsInputWizard
              user={customer}
              draftListingId={draft.id}
              initialStep={draft.listingIntake.currentStep}
              initialData={data}
            />
          </Stack>
        </Container>
      </SitePageLayout>
    );
  }

  if (!startNew) {
    const listings = await getCustomerListings(user.id);
    const drafts = getMlsDrafts(listings);

    if (drafts.length > 0) {
      return (
        <SitePageLayout user={user}>
          <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
            <Stack spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
                  MLS listing intake
                </Typography>
                <Typography color="text.secondary">
                  Resume a saved draft or start a new MLS listing form.
                </Typography>
              </Stack>
              <MlsDraftChooser
                drafts={drafts}
                newListingHref={buildNewListingPath(params)}
              />
            </Stack>
          </Container>
        </SitePageLayout>
      );
    }
  }

  if (prefill?.inquiryId) {
    await prisma.sellInquiry.updateMany({
      where: { id: prefill.inquiryId, customerId: user.id },
      data: { status: SellInquiryStatus.LISTING_STARTED },
    });
  }

  const initialValues = prefill
    ? {
        address: prefill.address || undefined,
        city: prefill.city || undefined,
        state: prefill.state || undefined,
        zip: prefill.zip || undefined,
        inquiryId: prefill.inquiryId,
      }
    : undefined;

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
          <MlsInputWizard user={customer} initialValues={initialValues} />
        </Stack>
      </Container>
    </SitePageLayout>
  );
}
