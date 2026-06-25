import { crmListingUrl, sendEmail } from "@/lib/email/send";

function agentEmail(): string {
  return process.env.AGENT_NOTIFICATION_EMAIL ?? "blair@utahdigs.com";
}

export async function sendMlsIntakeSubmittedEmail(input: {
  listingId: string;
  address: string;
  city: string;
  state: string;
  sellerName: string;
  offerFormUrl?: string;
}): Promise<void> {
  const detailUrl = crmListingUrl(input.listingId);
  const offerLine = input.offerFormUrl
    ? `<p>Offer form: <a href="${input.offerFormUrl}">${input.offerFormUrl}</a></p>`
    : "";

  await sendEmail({
    to: agentEmail(),
    subject: `New MLS intake: ${input.address}, ${input.city}`,
    html: `
      <h2>New MLS listing intake submitted</h2>
      <p><strong>${input.sellerName}</strong> submitted the full MLS intake form.</p>
      <p><strong>Property:</strong> ${input.address}, ${input.city}, ${input.state}</p>
      ${offerLine}
      <p><a href="${detailUrl}">Review in CRM</a></p>
    `,
  });
}

export async function sendListingWelcomeEmail(input: {
  sellerEmail: string;
  sellerName: string;
  portalSlug: string;
  pinHint: string;
  offerFormUrl?: string;
}): Promise<void> {
  const portal = process.env.NEXT_PUBLIC_PORTAL_URL
    ? `${process.env.NEXT_PUBLIC_PORTAL_URL.replace(/\/$/, "")}/${input.portalSlug}`
    : undefined;

  await sendEmail({
    to: input.sellerEmail,
    subject: "Your Utah Digs listing is live",
    html: `
      <h2>Welcome, ${input.sellerName}</h2>
      <p>Your listing has been approved and is now live on Utah Digs.</p>
      ${
        portal
          ? `<p><strong>Seller portal:</strong> <a href="${portal}">${portal}</a></p>
             <p>Your portal PIN is the last 4 digits of the phone number on file (${input.pinHint}).</p>`
          : `<p>Your portal PIN is the last 4 digits of the phone number on file (${input.pinHint}).</p>`
      }
      ${
        input.offerFormUrl
          ? `<p><strong>Offer form:</strong> <a href="${input.offerFormUrl}">${input.offerFormUrl}</a></p>`
          : ""
      }
    `,
  });
}
