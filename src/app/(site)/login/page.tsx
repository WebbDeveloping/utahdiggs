import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import ConsumerLoginForm from "@/components/account/ConsumerLoginForm";
import SitePageLayoutWithAuth from "@/components/layout/SitePageLayoutWithAuth";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Sign In",
  description: "Sign in to your Glide RE seller account to manage listings and track your home sale.",
  path: "/login",
});

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getConsumerSession();
  const { next } = await searchParams;
  const redirectPath = getSafeRedirectPath(next);

  if (user) {
    redirect(redirectPath);
  }

  return (
    <SitePageLayoutWithAuth>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: { xs: 6, md: 8 },
        }}
      >
        <ConsumerLoginForm next={next} />
      </Box>
    </SitePageLayoutWithAuth>
  );
}
