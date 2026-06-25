import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SellInquiryForm from "@/components/marketing/SellInquiryForm";
import SitePageLayoutWithAuth from "@/components/layout/SitePageLayoutWithAuth";

export const metadata: Metadata = {
  title: "List Your Home — Glide RE",
  description:
    "Enter your information and get in touch with an expert local agent to list your home with Glide RE.",
};

type SellInquiryPageProps = {
  searchParams: Promise<{ address?: string }>;
};

export default async function SellInquiryPage({ searchParams }: SellInquiryPageProps) {
  const { address } = await searchParams;
  const initialAddress = address?.trim() ?? "";

  return (
    <SitePageLayoutWithAuth>
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={3} sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h1" sx={{ fontSize: { xs: "2.25rem", md: "3rem" } }}>
            List Your Home
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: 18, mx: "auto", maxWidth: 480 }}>
            Enter your information below and we&apos;ll get you in touch with an expert
            local agent to get started!
          </Typography>
        </Stack>
        <SellInquiryForm initialAddress={initialAddress} />
      </Container>
    </SitePageLayoutWithAuth>
  );
}
