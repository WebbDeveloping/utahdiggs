import { redirect } from "next/navigation";
import EmailTemplateList from "@/components/crm/EmailTemplateList";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import { auth } from "@/lib/auth/admin-auth";
import { canManageUsers } from "@/lib/auth/roles";
import { getSessionUser } from "@/lib/crm/access";
import { listEmailTemplates } from "@/lib/email/template-queries";

export default async function EmailTemplatesPage() {
  const session = await auth();
  const user = getSessionUser(session);

  if (!user || !canManageUsers(user.role)) {
    redirect("/crm");
  }

  const templates = await listEmailTemplates();

  return (
    <>
      <CrmPageHeader
        title="Email templates"
        description="Customize transactional email subject lines and HTML content."
      />
      <EmailTemplateList templates={templates} />
    </>
  );
}
