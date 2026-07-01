import { redirect } from "next/navigation";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SellInquiryForm from "@/components/marketing/SellInquiryForm";
import SitePageLayoutWithAuth from "@/components/layout/SitePageLayoutWithAuth";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { createPageMetadata } from "@/lib/seo/metadata";
import { OG_IMAGES } from "@/lib/seo/site";

export const metadata = createPageMetadata({
  title: "List Your Home",
  description:
    "Enter your information and get in touch with an expert local agent to list your home with Glide RE.",
  path: "/sell/inquiry",
  ogImage: OG_IMAGES.sell,
});

type SellInquiryPageProps = {
  searchParams: Promise<{ address?: string }>;
};

export default async function SellInquiryPage({ searchParams }: SellInquiryPageProps) {
  const user = await getConsumerSession();
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
            Enter your information below{user ? "" : " and create a free account"} to start
            listing with Glide RE.
          </Typography>
        </Stack>
        <SellInquiryForm initialAddress={initialAddress} isLoggedIn={Boolean(user)} />
      </Container>
    </SitePageLayoutWithAuth>
  );
}
