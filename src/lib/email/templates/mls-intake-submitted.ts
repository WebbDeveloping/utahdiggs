import {
  crmDocumentUrl,
  crmListingTabUrl,
  crmListingUrl,
  sendEmail,
} from "@/lib/email/send";
import { resolveAgentNotificationEmail } from "@/lib/email/agent-notification";
import { renderEmailTemplate } from "@/lib/email/template-queries";

export async function sendMlsIntakeSubmittedEmail(input: {
  listingId: string;
  address: string;
  city: string;
  state: string;
  sellerName: string;
  signedAgreementDocumentId?: string | null;
}): Promise<void> {
  const agreementLine = input.signedAgreementDocumentId
    ? `<p><a href="${crmDocumentUrl(input.listingId, input.signedAgreementDocumentId)}">Signed right-to-sell agreement (PDF)</a></p>`
    : "";

  const rendered = await renderEmailTemplate("mls-intake-submitted", {
    sellerName: input.sellerName,
    address: input.address,
    city: input.city,
    state: input.state,
    detailUrl: crmListingUrl(input.listingId),
    intakeUrl: crmListingTabUrl(input.listingId, "intake"),
    agreementLine,
  });

  await sendEmail({
    to: await resolveAgentNotificationEmail(input.listingId),
    subject: rendered.subject,
    html: rendered.html,
  });
}
