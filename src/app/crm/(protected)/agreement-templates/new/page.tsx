import { redirect } from "next/navigation";
import AgreementTemplatePageActions from "@/components/crm/AgreementTemplatePageActions";
import AgreementTemplateUploadForm from "@/components/crm/AgreementTemplateUploadForm";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import { auth } from "@/lib/auth/admin-auth";
import { canManageUsers } from "@/lib/auth/roles";
import { getSessionUser } from "@/lib/crm/access";

export default async function NewAgreementTemplatePage() {
  const session = await auth();
  const user = getSessionUser(session);

  if (!user || !canManageUsers(user.role)) {
    redirect("/crm");
  }

  return (
    <>
      <CrmPageHeader
        title="Add agreement template"
        description="Upload a PDF template. You can place fields on it immediately after upload."
        action={<AgreementTemplatePageActions showAdd={false} />}
      />
      <AgreementTemplateUploadForm />
    </>
  );
}
