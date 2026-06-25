import CrmPageHeader from "@/components/crm/CrmPageHeader";
import { CrmPlaceholderPanel } from "@/components/crm/CrmStatCard";

export default function CrmDashboardPage() {
  return (
    <>
      <CrmPageHeader
        title="Dashboard"
        description="Overview of active listings, pending offers, and seller requests."
      />
      <CrmPlaceholderPanel
        title="Dashboard coming soon"
        description="Stats, recent listings, and quick actions will appear here once the CRM data views are built out."
      />
    </>
  );
}
