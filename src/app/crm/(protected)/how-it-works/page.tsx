import CrmHowItWorksGuide from "@/components/crm/CrmHowItWorksGuide";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import { auth } from "@/lib/auth/admin-auth";
import { requireCrmUser } from "@/lib/crm/access";

export default async function CrmHowItWorksPage() {
  const session = await auth();
  requireCrmUser(session);

  return (
    <>
      <CrmPageHeader
        title="How it works"
        description="A plain-language map of seller and team steps — from first contact to an Active MLS listing."
      />
      <CrmHowItWorksGuide />
    </>
  );
}
