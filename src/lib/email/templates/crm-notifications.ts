import { crmListingUrl, sendEmail } from "@/lib/email/send";
import { resolveAgentNotificationEmail } from "@/lib/email/agent-notification";
import { renderEmailTemplate } from "@/lib/email/template-queries";

export async function sendOfferSubmittedEmail(input: {
  listingId: string;
  address: string;
  city: string;
  state: string;
  offerPrice: string;
  buyersAgent: string;
  buyerName: string;
}): Promise<void> {
  const rendered = await renderEmailTemplate("offer-submitted", {
    address: input.address,
    city: input.city,
    state: input.state,
    offerPrice: input.offerPrice,
    buyerName: input.buyerName,
    buyersAgent: input.buyersAgent,
    detailUrl: crmListingUrl(input.listingId),
  });

  await sendEmail({
    to: await resolveAgentNotificationEmail(input.listingId),
    subject: rendered.subject,
    html: rendered.html,
  });
}

export async function sendListingActivatedEmail(input: {
  listingId: string;
  address: string;
  city: string;
  state: string;
  sellerName: string;
  mlsNumber?: string | null;
}): Promise<void> {
  const mlsNumber = input.mlsNumber?.trim()
    ? input.mlsNumber.trim()
    : "Not entered yet";

  const rendered = await renderEmailTemplate("listing-activated", {
    sellerName: input.sellerName,
    address: input.address,
    city: input.city,
    state: input.state,
    mlsNumber,
    detailUrl: crmListingUrl(input.listingId),
  });

  await sendEmail({
    to: await resolveAgentNotificationEmail(input.listingId),
    subject: rendered.subject,
    html: rendered.html,
  });
}

export async function sendListingAssignedEmail(input: {
  agentEmail: string;
  agentName?: string | null;
  address: string;
  city: string;
  state: string;
  listingId: string;
}): Promise<void> {
  const rendered = await renderEmailTemplate("listing-assigned", {
    greeting: input.agentName ? input.agentName : "there",
    address: input.address,
    city: input.city,
    state: input.state,
    detailUrl: crmListingUrl(input.listingId),
  });

  await sendEmail({
    to: input.agentEmail,
    subject: rendered.subject,
    html: rendered.html,
  });
}
