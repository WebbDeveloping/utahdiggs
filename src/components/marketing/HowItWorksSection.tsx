import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SectionHeading from "@/components/marketing/SectionHeading";
import { sectionAnchorSx } from "@/components/marketing/marketing-section";

const steps = [
  {
    number: 1,
    title: "Tell us about your home",
    description: "Add your property and pick a plan. Takes about three minutes.",
  },
  {
    number: 2,
    title: "Get market-ready",
    description:
      "We help with pricing, photos, and (on Full Service) staging and an on-site visit.",
  },
  {
    number: 3,
    title: "Go live everywhere",
    description: "Your home hits the MLS and every major site buyers actually search.",
  },
  {
    number: 4,
    title: "Review offers & close",
    description: "We manage paperwork and negotiation so you keep more at the closing table.",
  },
] as const;

export default function HowItWorksSection() {
  return (
    <Box
      component="section"
      id="how"
      sx={{
        ...sectionAnchorSx,
        py: { xs: 7, md: 10 },
        backgroundColor: "background.paper",
        borderTop: 1,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <SectionHeading
          title="From listed to sold, the easy way"
          description="No pressure, no 3% bill at closing. Just a clear path and people who pick up the phone."
        />

        <Grid container spacing={{ xs: 3, md: 4 }}>
          {steps.map((step) => (
            <Grid key={step.number} size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack spacing={1.5} sx={{ height: "100%" }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "primary.light",
                    color: "primary.main",
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  {step.number}
                </Box>
                <Typography variant="h4" sx={{ fontSize: { xs: "1.125rem", md: "1.25rem" } }}>
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
