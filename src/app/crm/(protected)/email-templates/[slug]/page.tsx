import { notFound, redirect } from "next/navigation";
import EmailTemplateEditor from "@/components/crm/EmailTemplateEditor";
import EmailTemplateSwitcher from "@/components/crm/EmailTemplateSwitcher";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import { auth } from "@/lib/auth/admin-auth";
import { canManageUsers } from "@/lib/auth/roles";
import { getSessionUser } from "@/lib/crm/access";
import { listEmailTemplateDefinitions } from "@/lib/email/template-definitions";
import {
  getEmailTemplateDetail,
  isValidEmailTemplateSlug,
} from "@/lib/email/template-queries";

type EmailTemplateEditPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EmailTemplateEditPage({
  params,
}: EmailTemplateEditPageProps) {
  const session = await auth();
  const user = getSessionUser(session);

  if (!user || !canManageUsers(user.role)) {
    redirect("/crm");
  }

  const { slug } = await params;
  if (!isValidEmailTemplateSlug(slug)) {
    notFound();
  }

  const template = await getEmailTemplateDetail(slug);
  if (!template) {
    notFound();
  }

  const templates = listEmailTemplateDefinitions().map((definition) => ({
    slug: definition.slug,
    displayName: definition.displayName,
  }));

  return (
    <>
      <CrmPageHeader
        title={template.displayName}
        description={`${template.description} Sent to: ${template.recipientLabel}.`}
        action={
          <EmailTemplateSwitcher currentSlug={slug} templates={templates} />
        }
      />
      <EmailTemplateEditor
        template={template}
        adminEmail={session?.user?.email ?? ""}
      />
    </>
  );
}
