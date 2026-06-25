import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import ConsumerLoginForm from "@/components/account/ConsumerLoginForm";
import SitePageLayoutWithAuth from "@/components/layout/SitePageLayoutWithAuth";

export const metadata: Metadata = {
  title: "Sign in — Glide RE",
};

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
