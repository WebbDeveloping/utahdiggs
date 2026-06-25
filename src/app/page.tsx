import Box from "@mui/material/Box";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import HeroSection from "@/components/marketing/HeroSection";
import TrustStrip from "@/components/marketing/TrustStrip";

export default function Home() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteHeader />
      <Box component="main" sx={{ flex: 1 }}>
        <HeroSection />
        <TrustStrip />
      </Box>
      <SiteFooter />
    </Box>
  );
}
