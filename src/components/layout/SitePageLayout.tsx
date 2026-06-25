import Box from "@mui/material/Box";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

export type SiteUser = {
  name?: string | null;
  email: string;
};

type SitePageLayoutProps = {
  children: React.ReactNode;
  user?: SiteUser | null;
};

export default function SitePageLayout({ children, user = null }: SitePageLayoutProps) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteHeader user={user} />
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
      <SiteFooter />
    </Box>
  );
}
