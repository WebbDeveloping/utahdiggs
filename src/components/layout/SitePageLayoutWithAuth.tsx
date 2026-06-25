import { getConsumerSession } from "@/lib/auth/consumer-session";
import SitePageLayout from "@/components/layout/SitePageLayout";

type SitePageLayoutWithAuthProps = {
  children: React.ReactNode;
};

export default async function SitePageLayoutWithAuth({
  children,
}: SitePageLayoutWithAuthProps) {
  const user = await getConsumerSession();

  return (
    <SitePageLayout user={user}>{children}</SitePageLayout>
  );
}
