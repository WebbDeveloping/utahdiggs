import { buildCrmDocumentHref } from "@/lib/storage/document-access";
import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
};

export async function sendEmail({
  to,
  subject,
  html,
  from,
}: SendEmailInput): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set; skipping email:", subject);
    return;
  }

  const { error } = await resend.emails.send({
    from: from ?? "Utah Digs <notifications@utahdigs.com>",
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }
}

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}

export type CrmListingTab = "summary" | "intake" | "print";

export function crmListingUrl(listingId: string): string {
  return `${appBaseUrl()}/crm/listings/${listingId}`;
}

export function crmListingTabUrl(
  listingId: string,
  tab: CrmListingTab,
): string {
  if (tab === "summary") {
    return crmListingUrl(listingId);
  }
  return `${crmListingUrl(listingId)}?tab=${tab}`;
}

export function crmDocumentUrl(listingId: string, documentId: string): string {
  return `${appBaseUrl()}${buildCrmDocumentHref(listingId, documentId, "view")}`;
}

export function accountLoginUrl(): string {
  return `${appBaseUrl()}/login`;
}

export function accountSignupUrl(): string {
  return `${appBaseUrl()}/signup`;
}
