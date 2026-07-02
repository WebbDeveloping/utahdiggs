import { redirect } from "next/navigation";
import AgreementFieldMapperClient from "@/components/crm/AgreementFieldMapperClient";
import AgreementTemplatePageActions from "@/components/crm/AgreementTemplatePageActions";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import { auth } from "@/lib/auth/admin-auth";
import { canManageUsers } from "@/lib/auth/roles";
import { getSessionUser } from "@/lib/crm/access";
import { listAgreementTemplates } from "@/lib/crm/agreement-template-queries";
import { UAR_EXCLUSIVE_RIGHT_TO_SELL_SLUG } from "@/lib/signature/agreement-template-definitions";

type PageProps = {
  searchParams: Promise<{ slug?: string; version?: string }>;
};

export default async function AgreementFieldMapperPage({ searchParams }: PageProps) {
  const session = await auth();
  const user = getSessionUser(session);

  if (!user || !canManageUsers(user.role)) {
    redirect("/crm");
  }

  const params = await searchParams;
  const templates = await listAgreementTemplates();

  const templateSummaries = templates.map((template) => ({
    slug: template.slug,
    version: template.version,
    displayName: template.displayName,
    revisionLabel: template.revisionLabel ?? "",
  }));

  const initialSlug =
    params.slug ??
    templates.find((template) => template.slug === UAR_EXCLUSIVE_RIGHT_TO_SELL_SLUG)?.slug ??
    templates[0]?.slug ??
    UAR_EXCLUSIVE_RIGHT_TO_SELL_SLUG;

  const initialVersion =
    params.version ??
    templates.find((template) => template.slug === initialSlug)?.version ??
    templates[0]?.version ??
    "";

  return (
    <>
      <CrmPageHeader
        title="Agreement field mapper"
        description="Place text, checkbox, and signature fields on agreement PDF templates. Save maps to Vercel Blob for the signing pipeline."
        action={<AgreementTemplatePageActions showList />}
      />
      <AgreementFieldMapperClient
        templates={templateSummaries}
        initialSlug={initialSlug}
        initialVersion={initialVersion}
      />
    </>
  );
}
