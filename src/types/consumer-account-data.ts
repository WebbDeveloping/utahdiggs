import type { OfferStatusValue, SellerRequestStatusValue } from "@/lib/crm/listing-status";

export type SellerListingScopeItem = {
  id: string;
  address: string;
  city: string;
  state: string;
  listPrice: string | null;
  listDate: Date | null;
  blairNote: string | null;
  blairNoteDate: Date | null;
};

export type ConsumerShowingRow = {
  id: string;
  listingId: string;
  listingAddress: string;
  listingCity: string;
  showingDate: Date;
  showingTime: string | null;
  showingLabel: string | null;
  buyersAgent: string | null;
  feedback: string | null;
};

export type ConsumerOfferRow = {
  id: string;
  listingId: string;
  listingAddress: string;
  listingCity: string;
  listPrice: string | null;
  submittedDate: Date;
  offerPrice: string | null;
  buyersAgent: string | null;
  status: OfferStatusValue;
};

export type ConsumerWeeklyStatRow = {
  id: string;
  listingId: string;
  listingAddress: string;
  listingCity: string;
  weekEnding: Date;
  listtracTotal30d: number | null;
  ureViews30d: number | null;
  zillowViews30d: number | null;
  realtorViews30d: number | null;
  homesViews30d: number | null;
  truliaViews30d: number | null;
  ureFavoritesCumulative: number | null;
  lifetimeViews: number | null;
};

export type ConsumerMarketDataRow = {
  id: string;
  city: string;
  reportDate: Date;
  homesForSale: number | null;
  newToMarket: number | null;
  homesSoldCount: number | null;
  avgDom: number | null;
  avgHomePrice: string | null;
  avgSoldPrice: string | null;
  pricePerSqFt: string | null;
  priceReductionsCount: number | null;
  soldToListedRatio: string | null;
};

export type ConsumerSellerRequestRow = {
  id: string;
  listingId: string;
  listingAddress: string;
  listingCity: string;
  submittedAt: Date;
  status: SellerRequestStatusValue;
  requestSummary: string | null;
  updateTypes: string[];
};

export type AccountDashboardStats = {
  showingsLast30Days: number;
  pendingOffers: number;
  latestWeekViews: number | null;
  activeListingCount: number;
};

export type WeeklyReportData = {
  listings: SellerListingScopeItem[];
  statsByListing: ConsumerWeeklyStatRow[];
  recentShowings: ConsumerShowingRow[];
};
