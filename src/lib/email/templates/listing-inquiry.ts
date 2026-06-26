import { resolveAgentNotificationEmail } from "@/lib/email/agent-notification";
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

  await sendEmail({
    to: await resolveAgentNotificationEmail(input.listingId),
    subject: `${subjectPrefix}: ${input.address}, ${input.city}`,
    html: `
      <h2>${subjectPrefix}</h2>
      <p><strong>Property:</strong> ${input.address}, ${input.city}, ${input.state}</p>
      <p><strong>Name:</strong> ${input.name}</p>
      <p><strong>Email:</strong> <a href="mailto:${input.email}">${input.email}</a></p>
      <p><strong>Phone:</strong> ${input.phone}</p>
      ${preferredDateLine}
      ${messageLine}
    `,
  });
}
