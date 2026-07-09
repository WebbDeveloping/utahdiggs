import {
  crmDocumentUrl,
  crmListingTabUrl,
  crmListingUrl,
  sendEmail,
} from "@/lib/email/send";
import { resolveAgentNotificationEmail } from "@/lib/email/agent-notification";

export async function sendMlsIntakeSubmittedEmail(input: {
  listingId: string;
  address: string;
  city: string;
  state: string;
  sellerName: string;
  signedAgreementDocumentId?: string | null;
}): Promise<void> {
  const detailUrl = crmListingUrl(input.listingId);
  const intakeUrl = crmListingTabUrl(input.listingId, "intake");
  const agreementLine = input.signedAgreementDocumentId
    ? `<p><a href="${crmDocumentUrl(input.listingId, input.signedAgreementDocumentId)}">Signed right-to-sell agreement (PDF)</a></p>`
    : "";

  await sendEmail({
    to: await resolveAgentNotificationEmail(input.listingId),
    subject: `Ready for Matrix entry: ${input.address}, ${input.city}`,
    html: `
      <h2>Ready for Matrix entry</h2>
      <p><strong>${input.sellerName}</strong> submitted the full MLS intake form.</p>
      <p><strong>Property:</strong> ${input.address}, ${input.city}, ${input.state}</p>
      <p><strong>Action required:</strong> Enter this listing in WFRMLS Matrix.</p>
      <p><a href="${detailUrl}">CRM listing summary</a></p>
      <p><a href="${intakeUrl}">MLS Intake form (copy fields for Matrix)</a></p>
      ${agreementLine}
    `,
  });
}
