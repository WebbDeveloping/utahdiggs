import ContactSection from "@/components/marketing/ContactSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, OG_IMAGES } from "@/lib/seo/site";
import FaqSection from "@/components/marketing/FaqSection";
import HeroSection from "@/components/marketing/HeroSection";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import PricingSection from "@/components/marketing/PricingSection";
import TrustStrip from "@/components/marketing/TrustStrip";
import SitePageLayoutWithAuth from "@/components/layout/SitePageLayoutWithAuth";

export const metadata = createPageMetadata({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: "/",
  ogImage: OG_IMAGES.default,
  absoluteTitle: true,
});

export default function Home() {
  return (
    <SitePageLayoutWithAuth>
      <HeroSection />
      <TrustStrip />
      <PricingSection />
      <HowItWorksSection />
      <FaqSection />
      <ContactSection />
    </SitePageLayoutWithAuth>
  );
}
