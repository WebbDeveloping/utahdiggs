import { crmListingUrl, sendEmail } from "@/lib/email/send";
import { resolveAgentNotificationEmail } from "@/lib/email/agent-notification";
import { formatCallDateForEmail } from "@/lib/consumer/call-datetime";
import { buildOnboardingPath, formatServicePlan } from "@/lib/consumer/onboarding";
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
  const detailUrl = crmListingUrl(input.listingId);
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

  await sendEmail({
    to: await resolveAgentNotificationEmail(input.listingId),
    subject: `New seller onboarding: ${input.address}, ${input.city}`,
    html: `
      <h2>New seller onboarding</h2>
      <p><strong>${input.sellerName}</strong> scheduled an onboarding call.</p>
      <p><strong>Property:</strong> ${input.address}, ${input.city}, ${input.state}</p>
      <p><strong>Plan:</strong> ${formatServicePlan(input.servicePlan)}</p>
      <p><strong>Call time:</strong> ${when}</p>
      ${notesLine}
      <p><strong>Completed so far:</strong></p>
      <ul>
        <li>Listing agreement signed (${agreementDate})</li>
        <li>${input.photoCount} photo(s) uploaded</li>
        ${tourLine}
      </ul>
      <p><a href="${detailUrl}">View in CRM</a></p>
    `,
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
  const firstName = sellerFirstName(input.sellerName);
  const when = formatCallDateForEmail(input.scheduledCallAt);
  const propertyLine = `${input.address}, ${input.city}, ${input.state}`;
  const onboardingUrl = `${appBaseUrl()}${buildOnboardingPath(input.listingId)}`;
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

  await sendEmail({
    to: input.sellerEmail,
    subject: `Your onboarding call is scheduled — ${input.address}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Onboarding call scheduled</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
<tr>
  <td style="background:#1a3a5c;padding:28px 28px 24px;">
    <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;">${SITE_NAME}</p>
    <h1 style="margin:8px 0 0;font-size:22px;font-weight:600;color:#ffffff;">Your call is scheduled</h1>
  </td>
</tr>
<tr>
  <td style="padding:24px 28px 8px;">
    <p style="font-size:15px;color:#1e293b;line-height:1.65;margin:0 0 12px;">Hi ${firstName},</p>
    <p style="font-size:15px;color:#1e293b;line-height:1.65;margin:0 0 12px;">
      Your onboarding call for <strong>${propertyLine}</strong> is scheduled for:
    </p>
    <p style="font-size:16px;color:#1a3a5c;font-weight:600;margin:0 0 16px;">${when}</p>
    <p style="font-size:14px;color:#475569;line-height:1.65;margin:0;">
      On this 30-minute call, we&apos;ll walk through your listing details, answer questions, and help you get ready for MLS intake.
    </p>
  </td>
</tr>
${notesBlock}
<tr>
  <td style="padding:16px 28px 28px;">
    <a href="${onboardingUrl}" style="display:inline-block;background:#1a3a5c;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:8px;">View onboarding checklist</a>
  </td>
</tr>
</table>
</td></tr>
</table>
</body>
</html>`,
  });
}
