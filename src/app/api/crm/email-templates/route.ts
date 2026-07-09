import { NextResponse } from "next/server";
import { requireEmailTemplateAdmin } from "@/lib/crm/email-template-admin";
import { listEmailTemplates } from "@/lib/email/template-queries";

export async function GET() {
  const { response } = await requireEmailTemplateAdmin();
  if (response) return response;

  const templates = await listEmailTemplates();
  return NextResponse.json({ templates });
}
