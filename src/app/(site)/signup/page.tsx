import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import ConsumerSignupForm from "@/components/account/ConsumerSignupForm";
import SitePageLayoutWithAuth from "@/components/layout/SitePageLayoutWithAuth";

export const metadata: Metadata = {
  title: "Create account — Glide RE",
};

export default async function SignupPage() {
  const user = await getConsumerSession();
  if (user) {
    redirect("/account");
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
        <ConsumerSignupForm />
      </Box>
    </SitePageLayoutWithAuth>
  );
}
