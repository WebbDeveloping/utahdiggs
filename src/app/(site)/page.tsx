import ContactSection from "@/components/marketing/ContactSection";
import FaqSection from "@/components/marketing/FaqSection";
import HeroSection from "@/components/marketing/HeroSection";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import PricingSection from "@/components/marketing/PricingSection";
import TrustStrip from "@/components/marketing/TrustStrip";
import SitePageLayoutWithAuth from "@/components/layout/SitePageLayoutWithAuth";

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
