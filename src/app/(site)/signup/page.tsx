import { redirect } from "next/navigation";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import ConsumerSignupForm from "@/components/account/ConsumerSignupForm";
import AuthSplitLayout from "@/components/layout/AuthSplitLayout";
import SitePageLayoutWithAuth from "@/components/layout/SitePageLayoutWithAuth";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Create Account",
  description: "Create a Glide RE seller account to list your home and manage your listing online.",
  path: "/signup",
});

type SignupPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const user = await getConsumerSession();
  const { next } = await searchParams;
  const redirectPath = getSafeRedirectPath(next);

  if (user) {
    redirect(redirectPath);
  }

  return (
    <SitePageLayoutWithAuth>
      <AuthSplitLayout>
        <ConsumerSignupForm next={next} variant="plain" />
      </AuthSplitLayout>
    </SitePageLayoutWithAuth>
  );
}
