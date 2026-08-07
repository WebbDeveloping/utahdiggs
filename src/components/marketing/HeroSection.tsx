import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinkButton from "@/components/ui/LinkButton";
import SavingsCalculatorCard from "@/components/marketing/SavingsCalculatorCard";
import { LISTING_INTAKE_PATH } from "@/lib/consumer/listing-prefill";

export default function HeroSection() {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        py: { xs: 6, md: 10 },
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(900px 380px at 78% -8%, #dff0e9, transparent 60%)",
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={{ xs: 4, md: 6 }} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2.75}>
              <Chip
                label="Discount listing brokerage"
                variant="filled"
                sx={{ alignSelf: "flex-start" }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2.5rem", sm: "3.25rem", md: "3.5rem", lg: "4.25rem" },
                }}
              >
                Sell your home.
                <br />
                Keep your{" "}
                <Box component="span" sx={{ color: "primary.main" }}>
                  equity
                </Box>
                .
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ maxWidth: 440, fontSize: { xs: "1rem", md: "1.125rem" } }}
              >
                List with Glide RE for a fraction of a traditional commission — and keep more of
                what your home is worth.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <LinkButton href={LISTING_INTAKE_PATH} variant="contained" size="large">
                  List your home
                </LinkButton>
                <LinkButton href="#calc" variant="outlined" size="large" color="inherit">
                  See what you&apos;d save
                </LinkButton>
              </Stack>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SavingsCalculatorCard />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
