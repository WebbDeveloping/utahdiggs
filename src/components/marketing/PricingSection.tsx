import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MarketingLinkButton from "@/components/marketing/MarketingLinkButton";
import SectionHeading from "@/components/marketing/SectionHeading";
import { sectionAnchorSx } from "@/components/marketing/marketing-section";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { LISTING_INTAKE_PATH } from "@/lib/consumer/listing-prefill";

const plans = [
  {
    id: "virtual",
    name: "Virtual",
    rate: "1%",
    pitch: "Everything you need to list and sell yourself, guided by our team the whole way.",
    features: [
      "Listed on the MLS for maximum exposure",
      "Syndicated to Zillow, Redfin, Realtor.com & more",
      "Professional yard sign & listing photos coordination",
      "Pricing & comparable-sales report",
      "Offer management & e-sign paperwork",
      "Phone & chat support from licensed agents",
      "Contractor key box for showings",
    ],
    finePrint: "Listing fee is 1% of the final sale price or $4,500, whichever is greater.",
    featured: false,
  },
  {
    id: "full-service",
    name: "Full Service",
    rate: "1.5%",
    pitch:
      "Everything in Virtual, plus in-person help to get your home market-ready and showing-ready.",
    features: [
      "Everything in Virtual, plus:",
      "Staging consultation to maximize appeal",
      "On-site visit from one of our agents",
      "Secure MLS lock box (not a contractor key box)",
      "Priority offer review & negotiation support",
    ],
    finePrint: "Listing fee is 1.5% of the final sale price or $4,500, whichever is greater.",
    featured: true,
  },
] as const;

export default async function PricingSection() {
  const user = await getConsumerSession();
  const listHomeHref = user ? LISTING_INTAKE_PATH : "/sell/inquiry";

  return (
    <Box
      component="section"
      id="pricing"
      sx={{
        ...sectionAnchorSx,
        py: { xs: 7, md: 10 },
        backgroundColor: "background.default",
      }}
    >
      <Container maxWidth="lg">
        <SectionHeading
          title="Two ways to list. Both save you thousands."
          description="Pick the level of support that fits you. Same syndication, same MLS reach — you choose how hands-on you want us to be."
        />

        <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
          {plans.map((plan) => (
            <Grid key={plan.id} size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  p: { xs: 3, md: 3.5 },
                  borderRadius: 4,
                  border: 1,
                  borderColor: plan.featured ? "primary.main" : "divider",
                  backgroundColor: "background.paper",
                  boxShadow: plan.featured
                    ? "0 20px 40px rgba(14, 122, 95, 0.12)"
                    : "none",
                  position: "relative",
                }}
              >
                {plan.featured ? (
                  <Chip
                    label="Most popular"
                    color="primary"
                    size="small"
                    sx={{ position: "absolute", top: 20, right: 20 }}
                  />
                ) : null}

                <Typography variant="h3" sx={{ fontSize: { xs: "1.5rem", md: "1.75rem" } }}>
                  {plan.name}
                </Typography>

                <Typography
                  sx={{
                    mt: 1.5,
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontSize: { xs: "2.5rem", md: "3rem" },
                    fontWeight: 600,
                    lineHeight: 1,
                    color: "primary.main",
                  }}
                >
                  {plan.rate}
                  <Typography
                    component="span"
                    sx={{ fontSize: "1rem", fontWeight: 500, color: "text.secondary", ml: 0.5 }}
                  >
                    listing fee
                  </Typography>
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 2.5 }}>
                  {plan.pitch}
                </Typography>

                <Stack component="ul" spacing={1.25} sx={{ listStyle: "none", m: 0, p: 0, flex: 1 }}>
                  {plan.features.map((feature) => (
                    <Box
                      component="li"
                      key={feature}
                      sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}
                    >
                      <CheckCircleOutlinedIcon
                        sx={{ fontSize: 20, color: "primary.main", mt: 0.25, flexShrink: 0 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                <MarketingLinkButton
                  href={listHomeHref}
                  variant={plan.featured ? "contained" : "outlined"}
                  color="primary"
                  fullWidth
                  sx={{ mt: 3 }}
                >
                  Choose {plan.name}
                </MarketingLinkButton>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1.5, lineHeight: 1.5 }}
                >
                  {plan.finePrint}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
