import CrmPageHeader from "@/components/crm/CrmPageHeader";
import { CrmPlaceholderPanel } from "@/components/crm/CrmStatCard";

export default function CrmRequestsPage() {
  return (
    <>
      <CrmPageHeader
        title="Seller requests"
        description="Price reductions, open house requests, and messages from sellers."
      />
      <CrmPlaceholderPanel
        title="Request queue coming soon"
        description="This page will show new seller requests with status tracking and assignment to team members."
      />
    </>
  );
}
