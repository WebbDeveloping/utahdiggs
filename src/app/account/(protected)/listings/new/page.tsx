import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SitePageLayout from "@/components/layout/SitePageLayout";
import ConsumerListingForm from "@/components/account/ConsumerListingForm";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { parseListingPrefillFromSearchParams } from "@/lib/consumer/listing-prefill";
import { prisma } from "@/lib/db";
import { SellInquiryStatus } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Add listing — Glide RE",
};

type NewAccountListingPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewAccountListingPage({
  searchParams,
}: NewAccountListingPageProps) {
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
  const prefill = parseListingPrefillFromSearchParams(params);

  if (prefill?.inquiryId) {
    await prisma.sellInquiry.updateMany({
      where: {
        id: prefill.inquiryId,
        customerId: user.id,
      },
      data: {
        status: SellInquiryStatus.LISTING_STARTED,
      },
    });
  }

  const initialValues = prefill
    ? {
        address: prefill.address || undefined,
        city: prefill.city || undefined,
        state: prefill.state || undefined,
        zip: prefill.zip || undefined,
        sellerName: customer.name ?? undefined,
        sellerPhone: customer.phone ?? undefined,
        inquiryId: prefill.inquiryId,
      }
    : {
        sellerName: customer.name ?? undefined,
        sellerPhone: customer.phone ?? undefined,
      };

  return (
    <SitePageLayout user={user}>
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={4}>
          <Stack spacing={1}>
            <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
              List your home
            </Typography>
            <Typography color="text.secondary">
              Submit your property details for review by the Glide RE team.
            </Typography>
          </Stack>
          <ConsumerListingForm user={customer} initialValues={initialValues} />
        </Stack>
      </Container>
    </SitePageLayout>
  );
}
