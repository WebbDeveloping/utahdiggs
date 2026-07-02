"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import type { ListingStatusValue } from "@/lib/crm/listing-status";
import ClosingTeamCards from "@/components/account/listing-detail/ClosingTeamCards";
import ListingBlairNote from "@/components/account/listing-detail/ListingBlairNote";
import ListingContractCard from "@/components/account/listing-detail/ListingContractCard";
import ListingDocumentsTab from "@/components/account/listing-detail/ListingDocumentsTab";
import ListingImagesTab from "@/components/account/listing-detail/ListingImagesTab";
import ListingOffersTab from "@/components/account/listing-detail/ListingOffersTab";
import ListingSellerGuideTab from "@/components/account/listing-detail/ListingSellerGuideTab";
import ListingSellerRequestsTab from "@/components/account/listing-detail/ListingSellerRequestsTab";
import type { ConsumerListingDetail } from "@/types/consumer-listing-detail";

type TabId = "overview" | "offers" | "guide" | "images" | "documents" | "requests";

type ListingDashboardTabsProps = {
  listing: ConsumerListingDetail;
};

function getVisibleTabs(status: ListingStatusValue): TabId[] {
  if (status === "SUBMITTED") {
    return ["guide", "images", "documents"];
  }
  return ["overview", "offers", "guide", "images", "documents", "requests"];
}

const TAB_LABELS: Record<TabId, string> = {
  overview: "Overview",
  offers: "Offers",
  guide: "Seller Guide",
  images: "Images",
  documents: "Documents",
  requests: "Seller Requests",
};

export default function ListingDashboardTabs({ listing }: ListingDashboardTabsProps) {
  const visibleTabs = useMemo(() => getVisibleTabs(listing.status), [listing.status]);
  const [tab, setTab] = useState<TabId>(visibleTabs[0]);

  const activeTab = visibleTabs.includes(tab) ? tab : visibleTabs[0];
  const acceptedOffer = listing.offers.find((o) => o.status === "ACCEPTED");
  const showContractCard =
    (listing.status === "UNDER_CONTRACT" || listing.status === "PENDING") &&
    acceptedOffer;

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(_, value: TabId) => setTab(value)}
        sx={{ mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {visibleTabs.map((tabId) => (
          <Tab
            key={tabId}
            value={tabId}
            label={
              tabId === "offers" ? (
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <span>{TAB_LABELS[tabId]}</span>
                  {listing.offers.length > 0 ? (
                    <Chip label={listing.offers.length} size="small" color="primary" />
                  ) : null}
                </Stack>
              ) : (
                TAB_LABELS[tabId]
              )
            }
          />
        ))}
      </Tabs>

      {activeTab === "overview" ? (
        <Stack spacing={3}>
          {showContractCard && acceptedOffer ? (
            <ListingContractCard offer={acceptedOffer} />
          ) : null}
          {listing.blairNote ? (
            <ListingBlairNote note={listing.blairNote} noteDate={listing.blairNoteDate} />
          ) : null}
          <ClosingTeamCards
            escrowOfficer={listing.escrowOfficer}
            transactionCoordinator={listing.transactionCoordinator}
          />
        </Stack>
      ) : null}

      {activeTab === "offers" ? (
        <ListingOffersTab offers={listing.offers} listPrice={listing.listPrice} />
      ) : null}

      {activeTab === "guide" ? <ListingSellerGuideTab /> : null}

      {activeTab === "images" ? <ListingImagesTab documents={listing.documents} /> : null}

      {activeTab === "documents" ? (
        <ListingDocumentsTab listingId={listing.id} documents={listing.documents} />
      ) : null}

      {activeTab === "requests" ? <ListingSellerRequestsTab listing={listing} /> : null}
    </Box>
  );
}
