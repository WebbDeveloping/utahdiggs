import { crmListingUrl, sendEmail, accountLoginUrl } from "@/lib/email/send";
import { resolveAgentNotificationEmail } from "@/lib/email/agent-notification";

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
    to: await resolveAgentNotificationEmail(input.listingId),
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
  offerFormUrl?: string;
}): Promise<void> {
  const loginUrl = accountLoginUrl();

  await sendEmail({
    to: input.sellerEmail,
    subject: "Your Utah Digs listing is live",
    html: `
      <h2>Welcome, ${input.sellerName}</h2>
      <p>Your listing has been approved and is now live on Utah Digs.</p>
      <p><a href="${loginUrl}">Sign in to your account</a> to track showings, offers, web traffic, and more.</p>
      ${
        input.offerFormUrl
          ? `<p><strong>Offer form:</strong> <a href="${input.offerFormUrl}">${input.offerFormUrl}</a></p>`
          : ""
      }
    `,
  });
}
