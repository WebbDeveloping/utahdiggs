import { crmListingUrl, sendEmail } from "@/lib/email/send";
import { resolveAgentNotificationEmail } from "@/lib/email/agent-notification";

export async function sendOfferSubmittedEmail(input: {
  listingId: string;
  address: string;
  city: string;
  state: string;
  offerPrice: string;
  buyersAgent: string;
  buyerName: string;
}): Promise<void> {
  const detailUrl = crmListingUrl(input.listingId);

  await sendEmail({
    to: await resolveAgentNotificationEmail(input.listingId),
    subject: `New offer: ${input.address}, ${input.city}`,
    html: `
      <h2>New offer submitted</h2>
      <p><strong>Property:</strong> ${input.address}, ${input.city}, ${input.state}</p>
      <p><strong>Offer price:</strong> ${input.offerPrice}</p>
      <p><strong>Buyer:</strong> ${input.buyerName}</p>
      <p><strong>Buyer's agent:</strong> ${input.buyersAgent}</p>
      <p><a href="${detailUrl}">Review in CRM</a></p>
    `,
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
  const detailUrl = crmListingUrl(input.listingId);
  const mlsLine = input.mlsNumber?.trim()
    ? input.mlsNumber.trim()
    : "Not entered yet";

  await sendEmail({
    to: await resolveAgentNotificationEmail(input.listingId),
    subject: `Listing live — add to Listtrac + Aligned: ${input.address}, ${input.city}`,
    html: `
      <h2>Listing is live</h2>
      <p><strong>${input.sellerName}</strong></p>
      <p><strong>Property:</strong> ${input.address}, ${input.city}, ${input.state}</p>
      <p><strong>MLS#:</strong> ${mlsLine}</p>
      <p><strong>Action required:</strong> Add this to Listtrac and Aligned Showings.</p>
      <p><a href="${detailUrl}">View in CRM</a></p>
    `,
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
  const detailUrl = crmListingUrl(input.listingId);
  const greeting = input.agentName ? input.agentName : "there";

  await sendEmail({
    to: input.agentEmail,
    subject: `Listing assigned: ${input.address}, ${input.city}`,
    html: `
      <h2>Hi ${greeting},</h2>
      <p>You have been assigned a new listing:</p>
      <p><strong>${input.address}</strong>, ${input.city}, ${input.state}</p>
      <p><a href="${detailUrl}">Open in CRM</a></p>
    `,
  });
}
