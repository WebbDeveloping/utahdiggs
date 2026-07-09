import {
  accountLoginUrl,
  accountSignupUrl,
  sendEmail,
} from "@/lib/email/send";
import { renderEmailTemplate } from "@/lib/email/template-queries";
import {
  AGENT_EMAIL,
  BROKERAGE_LINE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo/site";

export type ListingWelcomeEmailInput = {
  sellerEmail: string;
  sellerName: string;
  address: string;
  city: string;
  state?: string;
  offerFormUrl?: string;
};

function sellerFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] || "Seller";
}

function formatPropertyLine(input: ListingWelcomeEmailInput): string {
  const parts = [input.address, input.city];
  if (input.state) {
    parts.push(input.state);
  }
  return parts.join(", ");
}

export async function sendListingWelcomeEmail(
  input: ListingWelcomeEmailInput,
): Promise<void> {
  const offerBlock = input.offerFormUrl
    ? `
  <tr>
    <td style="padding:4px 28px 12px;">
      <p style="font-size:13px;color:#475569;line-height:1.65;margin:0;">
        <strong>Offer form:</strong>
        <a href="${input.offerFormUrl}" style="color:#1a3a5c;">${input.offerFormUrl}</a>
      </p>
    </td>
  </tr>`
    : "";

  const rendered = await renderEmailTemplate("listing-welcome", {
    propertyLine: formatPropertyLine(input),
    firstName: sellerFirstName(input.sellerName),
    loginUrl: accountLoginUrl(),
    signupUrl: accountSignupUrl(),
    siteName: SITE_NAME,
    sellerEmail: input.sellerEmail,
    offerBlock,
    brokerageLine: BROKERAGE_LINE,
    agentEmail: AGENT_EMAIL,
    siteUrl: SITE_URL,
  });

  await sendEmail({
    to: input.sellerEmail,
    subject: rendered.subject,
    html: rendered.html,
  });
}
