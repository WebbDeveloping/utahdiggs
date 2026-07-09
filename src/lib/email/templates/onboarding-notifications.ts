import { crmListingUrl, sendEmail } from "@/lib/email/send";
import { resolveAgentNotificationEmail } from "@/lib/email/agent-notification";
import { formatCallDateForEmail } from "@/lib/consumer/call-datetime";
import { buildOnboardingPath, formatServicePlan } from "@/lib/consumer/onboarding";
import { renderEmailTemplate } from "@/lib/email/template-queries";
import { SITE_NAME } from "@/lib/seo/site";
import type { ServicePlan } from "@/generated/prisma/client";

function appBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

function sellerFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] || "there";
}

export async function sendOnboardingCallScheduledEmail(input: {
  listingId: string;
  address: string;
  city: string;
  state: string;
  sellerName: string;
  servicePlan: ServicePlan | null;
  scheduledCallAt: Date;
  callNotes?: string | null;
  agreementSignedAt: Date;
  photoCount: number;
  proPhotoTourRequested: boolean;
}): Promise<void> {
  const when = formatCallDateForEmail(input.scheduledCallAt);
  const agreementDate = input.agreementSignedAt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Denver",
  });
  const notesLine = input.callNotes?.trim()
    ? `<p><strong>Seller notes:</strong> ${input.callNotes.trim()}</p>`
    : "";
  const tourLine = input.proPhotoTourRequested
    ? "<li>Professional photo tour requested</li>"
    : "";

  const rendered = await renderEmailTemplate("onboarding-call-scheduled", {
    sellerName: input.sellerName,
    address: input.address,
    city: input.city,
    state: input.state,
    servicePlan: formatServicePlan(input.servicePlan),
    callTime: when,
    notesLine,
    agreementDate,
    photoCount: String(input.photoCount),
    tourLine,
    detailUrl: crmListingUrl(input.listingId),
  });

  await sendEmail({
    to: await resolveAgentNotificationEmail(input.listingId),
    subject: rendered.subject,
    html: rendered.html,
  });
}

export async function sendOnboardingCallConfirmationEmail(input: {
  listingId: string;
  sellerEmail: string;
  sellerName: string;
  address: string;
  city: string;
  state: string;
  scheduledCallAt: Date;
  callNotes?: string | null;
}): Promise<void> {
  const notesBlock = input.callNotes?.trim()
    ? `
  <tr>
    <td style="padding:4px 28px 12px;">
      <p style="font-size:13px;color:#475569;line-height:1.65;margin:0;">
        <strong>Your notes:</strong> ${input.callNotes.trim()}
      </p>
    </td>
  </tr>`
    : "";

  const rendered = await renderEmailTemplate("onboarding-call-confirmation", {
    siteName: SITE_NAME,
    firstName: sellerFirstName(input.sellerName),
    propertyLine: `${input.address}, ${input.city}, ${input.state}`,
    callTime: formatCallDateForEmail(input.scheduledCallAt),
    notesBlock,
    onboardingUrl: `${appBaseUrl()}${buildOnboardingPath(input.listingId)}`,
  });

  await sendEmail({
    to: input.sellerEmail,
    subject: rendered.subject,
    html: rendered.html,
  });
}
