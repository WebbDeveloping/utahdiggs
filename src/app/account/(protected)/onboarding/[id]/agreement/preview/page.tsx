import type { Metadata } from "next";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinkButton from "@/components/ui/LinkButton";
import OnboardingStepLayout from "@/components/account/onboarding/OnboardingStepLayout";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { buildOnboardingPath } from "@/lib/consumer/onboarding";
import { getOnboardingListing } from "@/lib/consumer/onboarding-query";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Agreement PDF preview — Glide RE",
};

type AgreementPreviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AgreementPreviewPage({ params }: AgreementPreviewPageProps) {
  const user = await getConsumerSession();
  if (!user) return null;

  const { id } = await params;
  const listing = await getOnboardingListing(user.id, id);
  if (!listing) notFound();

  const agreementPath = `${buildOnboardingPath(listing.id)}/agreement`;
  const previewSrc = `/api/account/listings/${listing.id}/agreement/preview`;

  if (!listing.servicePlan) {
    return (
      <OnboardingStepLayout user={user} listing={listing} title="Agreement PDF preview">
        <Alert severity="warning">
          Choose a service plan first — the preview uses your listing address and plan defaults.
        </Alert>
        <LinkButton href={`${buildOnboardingPath(listing.id)}/plan`} variant="contained">
          Choose plan
        </LinkButton>
      </OnboardingStepLayout>
    );
  }

  return (
    <OnboardingStepLayout
      user={user}
      listing={listing}
      title="Agreement PDF preview"
      description="This is the official UAR Form 8 PDF filled with your listing data. Signing on the agreement step produces the same document with your real signatures."
      layout="shell"
    >
      <Stack spacing={3}>
        <Alert severity="info">
          Preview only — signature and initials placeholders are not your real e-signatures.
          Page 5 includes the cancellation addendum and a sample audit block.
        </Alert>

        <Paper
          variant="outlined"
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "grey.100",
          }}
        >
          <Box
            component="iframe"
            src={previewSrc}
            title="UAR listing agreement preview"
            sx={{
              display: "block",
              width: "100%",
              height: { xs: "70vh", md: "82vh" },
              border: 0,
              bgcolor: "white",
            }}
          />
        </Paper>

        <Stack spacing={1}>
          <Typography variant="subtitle2">How to test the full signing flow</Typography>
          <Typography variant="body2" color="text.secondary" component="ol" sx={{ pl: 2.5, m: 0 }}>
            <li>Go to the agreement step and complete the form fields.</li>
            <li>Add your signature and initials, accept e-sign consent, and click Sign agreement.</li>
            <li>
              Open the signed PDF from the documents tab — it uses the same generator as this
              preview.
            </li>
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
          <LinkButton href={agreementPath} variant="contained">
            {listing.agreementSignedAt ? "View agreement step" : "Go to sign agreement"}
          </LinkButton>
          <LinkButton href={buildOnboardingPath(listing.id)} color="inherit">
            Back to checklist
          </LinkButton>
        </Stack>
      </Stack>
    </OnboardingStepLayout>
  );
}
