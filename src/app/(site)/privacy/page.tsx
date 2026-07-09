import { LegalPageContent } from "@/components/marketing/LegalPageContent";
import SitePageLayoutWithAuth from "@/components/layout/SitePageLayoutWithAuth";
import { createPageMetadata } from "@/lib/seo/metadata";
import { CONTACT_EMAIL } from "@/lib/seo/site";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description: "How Glide RE collects, uses, and protects your personal information.",
  path: "/privacy",
});

const sections = [
  {
    title: "Information we collect",
    paragraphs: [
      "When you use Glide RE, we may collect information you provide directly, such as your name, email address, phone number, property address, and listing details. We also collect account credentials when you create an account.",
      "We may automatically collect basic usage information when you visit our website, such as browser type, pages viewed, and general device information.",
    ],
  },
  {
    title: "How we use your information",
    paragraphs: [
      "We use your information to provide listing services, respond to inquiries, communicate with you about your home sale, and improve our website and services.",
      "If you submit a form or create an account, we may contact you by phone, email, or text regarding your listing or related services. Message and data rates may apply where applicable.",
    ],
  },
  {
    title: "How we share information",
    paragraphs: [
      "We do not sell your personal information. We may share information with service providers who help us operate our business, such as hosting, email, and customer support tools, subject to appropriate confidentiality obligations.",
      "We may also disclose information when required by law or to protect the rights, safety, and security of Glide RE, our users, or others.",
    ],
  },
  {
    title: "Data retention and security",
    paragraphs: [
      "We retain personal information for as long as needed to provide services, comply with legal obligations, and resolve disputes.",
      "We use reasonable administrative, technical, and organizational measures to protect your information, but no method of transmission or storage is completely secure.",
    ],
  },
  {
    title: "Your choices",
    paragraphs: [
      "You may request access to, correction of, or deletion of certain personal information by contacting us. You may opt out of marketing text messages by replying STOP where applicable.",
      "Most browsers allow you to control cookies through browser settings. Some site features may not function properly if cookies are disabled.",
    ],
  },
  {
    title: "Contact us",
    paragraphs: [
      `If you have questions about this Privacy Policy or how we handle your information, contact us at ${CONTACT_EMAIL}.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <SitePageLayoutWithAuth>
      <LegalPageContent
        title="Privacy Policy"
        updated="June 25, 2026"
        intro="Glide RE respects your privacy. This policy explains what information we collect, how we use it, and the choices available to you."
        sections={sections}
      />
    </SitePageLayoutWithAuth>
  );
}
