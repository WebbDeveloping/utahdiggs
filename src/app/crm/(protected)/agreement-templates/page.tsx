import { redirect } from "next/navigation";
import AgreementTemplateList from "@/components/crm/AgreementTemplateList";
import AgreementTemplatePageActions from "@/components/crm/AgreementTemplatePageActions";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import { auth } from "@/lib/auth/admin-auth";
import { canManageUsers } from "@/lib/auth/roles";
import { getSessionUser } from "@/lib/crm/access";
import { listAgreementTemplatesWithFieldMapStatus } from "@/lib/crm/agreement-template-queries";

export default async function AgreementTemplatesPage() {
  const session = await auth();
  const user = getSessionUser(session);

  if (!user || !canManageUsers(user.role)) {
    redirect("/crm");
  }

  const templates = await listAgreementTemplatesWithFieldMapStatus();

  return (
    <>
      <CrmPageHeader
        title="Agreement templates"
        description="Upload PDF agreement templates and map fields for the signing pipeline."
        action={<AgreementTemplatePageActions showAdd showList={false} />}
      />
      <AgreementTemplateList templates={templates} />
    </>
  );
}
