import { LegalPageContent } from "@/components/marketing/LegalPageContent";
import SitePageLayoutWithAuth from "@/components/layout/SitePageLayoutWithAuth";
import { createPageMetadata } from "@/lib/seo/metadata";
import { CONTACT_EMAIL } from "@/lib/seo/site";

export const metadata = createPageMetadata({
  title: "Terms & Conditions",
  description: "Terms and conditions for using Glide RE listing services and website.",
  path: "/terms",
});

const sections = [
  {
    title: "Agreement to terms",
    paragraphs: [
      "By accessing or using the Glide RE website and services, you agree to these Terms & Conditions. If you do not agree, please do not use our services.",
    ],
  },
  {
    title: "Services",
    paragraphs: [
      "Glide RE provides discount real estate listing brokerage services in Utah. Specific services, fees, and plan details are described on our website and in any listing agreement you enter into with us.",
      "Information on this website is provided for general informational purposes and does not constitute legal, financial, or real estate advice.",
    ],
  },
  {
    title: "Accounts and listings",
    paragraphs: [
      "You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.",
      "You agree to provide accurate information about yourself and your property when submitting forms, creating listings, or communicating with Glide RE.",
    ],
  },
  {
    title: "Fees and communications",
    paragraphs: [
      "Listing fees and service terms are governed by your selected plan and any applicable listing agreement. Commission amounts and savings estimates shown on our website are illustrative and may vary by transaction.",
      "By submitting your contact information, you consent to be contacted by Glide RE by phone, email, and text regarding your inquiry or listing. Message and data rates may apply.",
    ],
  },
  {
    title: "Acceptable use",
    paragraphs: [
      "You agree not to misuse the website, attempt unauthorized access to our systems, submit false or misleading information, or use our services in violation of applicable law.",
      "We may suspend or terminate access to our services if we reasonably believe these terms have been violated.",
    ],
  },
  {
    title: "Disclaimer and limitation of liability",
    paragraphs: [
      "Our website and services are provided on an “as is” and “as available” basis to the fullest extent permitted by law. Glide RE disclaims warranties not expressly stated in a signed agreement.",
      "To the fullest extent permitted by law, Glide RE will not be liable for indirect, incidental, special, or consequential damages arising from your use of the website or services.",
    ],
  },
  {
    title: "Changes and contact",
    paragraphs: [
      "We may update these Terms & Conditions from time to time. Continued use of the website after changes are posted constitutes acceptance of the revised terms.",
      `Questions about these terms may be directed to ${CONTACT_EMAIL}.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <SitePageLayoutWithAuth>
      <LegalPageContent
        title="Terms & Conditions"
        updated="June 25, 2026"
        intro="These terms govern your use of the Glide RE website and related listing services. Please read them carefully before using our site or submitting your information."
        sections={sections}
      />
    </SitePageLayoutWithAuth>
  );
}
