import { redirect } from "next/navigation";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import MarketDataAdmin from "@/components/crm/MarketDataAdmin";
import { auth } from "@/lib/auth/admin-auth";
import { canEditMarketData, getSessionUser } from "@/lib/crm/access";
import {
  getMarketDataCities,
  getMarketDataReportDates,
  getMarketDataRows,
} from "@/lib/crm/market-data-queries";

type MarketDataPageProps = {
  searchParams: Promise<{ city?: string; reportDate?: string }>;
};

export default async function CrmMarketDataPage({ searchParams }: MarketDataPageProps) {
  const session = await auth();
  const user = getSessionUser(session);

  if (!user || !canEditMarketData(user)) {
    redirect("/crm");
  }

  const params = await searchParams;
  const selectedCity = params.city?.trim() ?? "";
  const selectedReportDate = params.reportDate?.trim() ?? "";

  const [rows, cities, reportDates] = await Promise.all([
    getMarketDataRows({
      city: selectedCity || undefined,
      reportDate: selectedReportDate || undefined,
    }),
    getMarketDataCities(),
    getMarketDataReportDates(),
  ]);
  const currentWeekDate = reportDates[0] ?? null;

  return (
    <>
      <CrmPageHeader
        title="Market data"
        description="Weekly city market snapshots. Edit or add rows here; locked overrides are skipped by Airtable sync."
      />
      <MarketDataAdmin
        rows={rows}
        cities={cities}
        reportDates={reportDates}
        currentWeekDate={currentWeekDate}
        selectedCity={selectedCity}
        selectedReportDate={selectedReportDate}
      />
    </>
  );
}
