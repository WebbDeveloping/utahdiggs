import { crmListingUrl, sendEmail } from "@/lib/email/send";
import { resolveAgentNotificationEmail } from "@/lib/email/agent-notification";
import { formatServicePlan } from "@/lib/consumer/onboarding";
import type { ServicePlan } from "@/generated/prisma/client";

export async function sendAgreementSignedEmail(input: {
  listingId: string;
  address: string;
  city: string;
  state: string;
  sellerName: string;
  servicePlan: ServicePlan;
}): Promise<void> {
  const detailUrl = crmListingUrl(input.listingId);

  await sendEmail({
    to: await resolveAgentNotificationEmail(input.listingId),
    subject: `Listing agreement signed: ${input.address}, ${input.city}`,
    html: `
      <h2>Listing agreement signed</h2>
      <p><strong>${input.sellerName}</strong> signed the listing agreement.</p>
      <p><strong>Property:</strong> ${input.address}, ${input.city}, ${input.state}</p>
      <p><strong>Plan:</strong> ${formatServicePlan(input.servicePlan)}</p>
      <p><a href="${detailUrl}">View in CRM</a></p>
    `,
  });
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
}): Promise<void> {
  const detailUrl = crmListingUrl(input.listingId);
  const when = input.scheduledCallAt.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const notesLine = input.callNotes?.trim()
    ? `<p><strong>Seller notes:</strong> ${input.callNotes.trim()}</p>`
    : "";

  await sendEmail({
    to: await resolveAgentNotificationEmail(input.listingId),
    subject: `Onboarding call requested: ${input.address}, ${input.city}`,
    html: `
      <h2>Onboarding call scheduled</h2>
      <p><strong>${input.sellerName}</strong> requested an onboarding call.</p>
      <p><strong>Property:</strong> ${input.address}, ${input.city}, ${input.state}</p>
      <p><strong>Plan:</strong> ${formatServicePlan(input.servicePlan)}</p>
      <p><strong>Requested time:</strong> ${when}</p>
      ${notesLine}
      <p><a href="${detailUrl}">View in CRM</a></p>
    `,
  });
}

export async function sendOnboardingPhotosSubmittedEmail(input: {
  listingId: string;
  address: string;
  city: string;
  sellerName: string;
  photoCount: number;
  proPhotoTourRequested: boolean;
}): Promise<void> {
  const detailUrl = crmListingUrl(input.listingId);
  const tourLine = input.proPhotoTourRequested
    ? "<p><strong>Professional photo tour requested.</strong></p>"
    : "";

  await sendEmail({
    to: await resolveAgentNotificationEmail(input.listingId),
    subject: `Listing photos uploaded: ${input.address}, ${input.city}`,
    html: `
      <h2>Listing photos submitted</h2>
      <p><strong>${input.sellerName}</strong> uploaded ${input.photoCount} photo(s).</p>
      <p><strong>Property:</strong> ${input.address}, ${input.city}</p>
      ${tourLine}
      <p><a href="${detailUrl}">Review in CRM</a></p>
    `,
  });
}
