import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SitePageLayout from "@/components/layout/SitePageLayout";
import type { OnboardingListingDetail } from "@/types/onboarding";

type OnboardingStepLayoutProps = {
  user: { name?: string | null; email: string };
  listing: OnboardingListingDetail;
  title?: string;
  description?: string;
  layout?: "default" | "shell";
  children: React.ReactNode;
};

export default function OnboardingStepLayout({
  user,
  listing,
  title,
  description,
  layout = "default",
  children,
}: OnboardingStepLayoutProps) {
  const isShell = layout === "shell";

  return (
    <SitePageLayout user={user}>
      <Container maxWidth={isShell ? "lg" : "md"} sx={{ py: { xs: 4, md: 6 } }}>
        {isShell ? (
          children
        ) : (
          <Stack spacing={4}>
            <Stack spacing={1}>
              <Typography variant="overline" color="text.secondary">
                {listing.address}, {listing.city}
              </Typography>
              <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
                {title}
              </Typography>
              {description ? (
                <Typography color="text.secondary">{description}</Typography>
              ) : null}
            </Stack>
            {children}
          </Stack>
        )}
      </Container>
    </SitePageLayout>
  );
}
