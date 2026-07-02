import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import HeroAddressTabs from "@/components/marketing/HeroAddressTabs";
import SavingsCalculatorCard from "@/components/marketing/SavingsCalculatorCard";
import { getConsumerSession } from "@/lib/auth/consumer-session";

export default async function HeroSection() {
  const user = await getConsumerSession();

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
              <HeroAddressTabs />
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
