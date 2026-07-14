import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MlsIntakeBanner from "@/components/account/MlsIntakeBanner";
import MlsIntakePromptDialog from "@/components/account/MlsIntakePromptDialog";
import MyListingsSection from "@/components/account/MyListingsSection";
import AccountDashboardStatsCards from "@/components/account/AccountDashboardStatsCards";
import PriceHealthCard from "@/components/account/PriceHealthCard";
import OverviewPendingOfferHighlight from "@/components/account/OverviewPendingOfferHighlight";
import OverviewRecentShowings from "@/components/account/OverviewRecentShowings";
import OverviewMarketTeaser from "@/components/account/OverviewMarketTeaser";
import OverviewListingSwitcher from "@/components/account/OverviewListingSwitcher";
import ListingBlairNote from "@/components/account/listing-detail/ListingBlairNote";
import LinkButton from "@/components/ui/LinkButton";
import { getMlsIntakePendingListings } from "@/lib/consumer/mls-draft";
import { priceChangeRequestHref } from "@/lib/consumer/price-change-path";
import type { PriceHealthResult } from "@/lib/consumer/coaching-rules";
import type { ListingOverviewMetrics } from "@/types/consumer-listing-detail";
import type { CustomerListingSummary } from "@/types/consumer-listing";
import type {
  ConsumerMarketDataRow,
  ConsumerOfferRow,
  ConsumerShowingRow,
} from "@/types/consumer-account-data";


type AccountDashboardProps = {
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
  listings: CustomerListingSummary[];
  metrics: ListingOverviewMetrics | null;
  priceHealth: PriceHealthResult | null;
  pendingOffer: ConsumerOfferRow | null;
  recentShowings: ConsumerShowingRow[];
  marketTeaser: ConsumerMarketDataRow | null;
  selectableListings: { id: string; address: string; city: string }[];
  draftSaved?: boolean;
  submitted?: boolean;
  mlsPromptListingId?: string | null;
};

export default function AccountDashboard({
  user,
  listings,
  metrics,
  priceHealth,
  pendingOffer,
  recentShowings,
  marketTeaser,
  selectableListings,
  draftSaved = false,
  submitted = false,
  mlsPromptListingId = null,
}: AccountDashboardProps) {
  const displayName = user.name?.trim() || user.email;
  const mlsPending = getMlsIntakePendingListings(listings);
  const promptListing = mlsPromptListingId
    ? listings.find((listing) => listing.id === mlsPromptListingId)
    : null;

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" }, mb: 1 }}>
          Welcome back{displayName ? `, ${displayName.split(" ")[0]}` : ""}
        </Typography>
        <Typography color="text.secondary">{user.email}</Typography>
      </Box>

      {submitted ? (
        <Alert severity="success">
          Your MLS intake was submitted successfully. Our team will review it before it goes
          live.
        </Alert>
      ) : null}

      {draftSaved ? (
        <Alert severity="success">
          Your MLS listing progress was saved. Use the section below to continue anytime.
        </Alert>
      ) : null}

      {mlsPending.length > 0 ? <MlsIntakeBanner listings={mlsPending} /> : null}

      {metrics ? (
        <OverviewListingSwitcher
          listings={selectableListings}
          selectedListingId={metrics.listingId}
        />
      ) : null}

      {metrics ? (
        <Typography variant="body2" color="text.secondary">
          Showing performance for {metrics.listingAddress}, {metrics.city}
        </Typography>
      ) : null}

      {priceHealth && metrics ? (
        <PriceHealthCard priceHealth={priceHealth} listingId={metrics.listingId} />
      ) : null}

      {metrics?.status === "ACTIVE" ? (
        <LinkButton
          href={priceChangeRequestHref(metrics.listingId)}
          variant="outlined"
          sx={{ alignSelf: "flex-start" }}
        >
          Request a price change
        </LinkButton>
      ) : null}

      <AccountDashboardStatsCards metrics={metrics} />

      {pendingOffer ? <OverviewPendingOfferHighlight offer={pendingOffer} /> : null}

      {metrics?.blairNote ? (
        <ListingBlairNote note={metrics.blairNote} noteDate={metrics.blairNoteDate} />
      ) : null}

      <OverviewRecentShowings showings={recentShowings} />

      <OverviewMarketTeaser market={marketTeaser} city={metrics?.city ?? null} />

      <MyListingsSection listings={listings} />

      <MlsIntakePromptDialog
        listingId={mlsPromptListingId}
        address={promptListing?.address}
      />
    </Stack>
  );
}
