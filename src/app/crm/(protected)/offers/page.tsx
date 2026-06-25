import CrmPageHeader from "@/components/crm/CrmPageHeader";
import { CrmPlaceholderPanel } from "@/components/crm/CrmStatCard";

export default function CrmOffersPage() {
  return (
    <>
      <CrmPageHeader
        title="Offers"
        description="Review incoming offers, update status, and manage contract details."
      />
      <CrmPlaceholderPanel
        title="Offer inbox coming soon"
        description="This page will list pending offers across all listings with filters, PDF previews, and accept/decline actions."
      />
    </>
  );
}
