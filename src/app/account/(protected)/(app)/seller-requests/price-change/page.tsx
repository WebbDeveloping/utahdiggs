import type { Metadata } from "next";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import AccountEmptyState from "@/components/account/AccountEmptyState";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import PriceReductionRequestForm from "@/components/account/PriceReductionRequestForm";
import LinkButton from "@/components/ui/LinkButton";
import { ListingStatus, SellerRequestStatus } from "@/generated/prisma/client";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Request a price change — Glide RE",
};

type PriceChangePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function PriceChangePage({ searchParams }: PriceChangePageProps) {
  const user = await getConsumerSession();
  if (!user) return null;

  const params = await searchParams;
  const listingId = getParam(params.listing)?.trim() ?? "";

  if (!listingId) {
    return (
      <>
        <AccountPageHeader
          title="Request a price change"
          description="Choose a listing from your overview to request a new list price."
        />
        <AccountEmptyState
          title="Select a listing"
          description="Open Overview, choose your active listing, then use Request a price change."
        />
        <LinkButton href="/account" variant="contained" sx={{ mt: 2 }}>
          Back to overview
        </LinkButton>
      </>
    );
  }

  const listing = await prisma.listing.findFirst({
    where: { id: listingId, customerId: user.id },
    select: {
      id: true,
      status: true,
      address: true,
      city: true,
      state: true,
      zip: true,
      listPrice: true,
    },
  });

  if (!listing) {
    return (
      <>
        <AccountPageHeader title="Request a price change" />
        <Alert severity="error">Listing not found.</Alert>
      </>
    );
  }

  const addressLabel = `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`;
  const listPrice = listing.listPrice != null ? Number(listing.listPrice) : NaN;

  if (listing.status !== ListingStatus.ACTIVE) {
    return (
      <>
        <AccountPageHeader
          title="Request a price change"
          description={addressLabel}
        />
        <Alert severity="info">
          Price changes are only available while your listing is active on the market.
        </Alert>
        <LinkButton href="/account" variant="text" sx={{ mt: 2 }}>
          Back to overview
        </LinkButton>
      </>
    );
  }

  if (!Number.isFinite(listPrice) || listPrice <= 0) {
    return (
      <>
        <AccountPageHeader
          title="Request a price change"
          description={addressLabel}
        />
        <Alert severity="warning">
          List price isn’t available for this listing yet. Check back after it’s set in MLS,
          or message Blair from your listing Requests tab.
        </Alert>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <LinkButton href={`/account/listings/${listing.id}`} variant="contained">
            Open listing
          </LinkButton>
          <LinkButton href="/account" variant="text">
            Back to overview
          </LinkButton>
        </Stack>
      </>
    );
  }

  const openRequest = await prisma.sellerRequest.findFirst({
    where: {
      listingId: listing.id,
      updateTypes: { has: "price_reduction" },
      status: { in: [SellerRequestStatus.NEW, SellerRequestStatus.IN_PROGRESS] },
    },
    select: { id: true },
  });

  return (
    <>
      <AccountPageHeader
        title="Request a price change"
        description="Pick a suggested cut or enter a custom amount. Blair will update MLS after reviewing your request."
      />
      <PriceReductionRequestForm
        listingId={listing.id}
        listPrice={listPrice}
        addressLabel={addressLabel}
        hasOpenRequest={Boolean(openRequest)}
      />
    </>
  );
}
