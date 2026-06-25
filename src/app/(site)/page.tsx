import HeroSection from "@/components/marketing/HeroSection";
import TrustStrip from "@/components/marketing/TrustStrip";
import SitePageLayoutWithAuth from "@/components/layout/SitePageLayoutWithAuth";

export default function Home() {
  return (
    <SitePageLayoutWithAuth>
      <HeroSection />
      <TrustStrip />
    </SitePageLayoutWithAuth>
  );
}
