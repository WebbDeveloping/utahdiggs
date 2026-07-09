import { resolveAgentNotificationEmail } from "@/lib/email/agent-notification";
import { renderEmailTemplate } from "@/lib/email/template-queries";
import { sendEmail } from "@/lib/email/send";
import type { ListingInquiryType } from "@/lib/consumer/listing-inquiry-validation";

export async function sendListingInquiryEmail(input: {
  listingId: string;
  type: ListingInquiryType;
  address: string;
  city: string;
  state: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredDate: string;
}): Promise<void> {
  const subjectPrefix = input.type === "tour" ? "Tour request" : "Info request";
  const preferredDateLine =
    input.type === "tour" && input.preferredDate
      ? `<p><strong>Preferred date:</strong> ${input.preferredDate}</p>`
      : "";
  const messageLine = input.message
    ? `<p><strong>Message:</strong><br>${input.message.replace(/\n/g, "<br>")}</p>`
    : "";

  const rendered = await renderEmailTemplate("listing-inquiry", {
    subjectPrefix,
    address: input.address,
    city: input.city,
    state: input.state,
    name: input.name,
    email: input.email,
    phone: input.phone,
    preferredDateLine,
    messageLine,
  });

  await sendEmail({
    to: await resolveAgentNotificationEmail(input.listingId),
    subject: rendered.subject,
    html: rendered.html,
  });
}
