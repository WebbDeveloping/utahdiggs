import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export default function HeroSection() {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        py: { xs: 8, md: 10 },
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
        <Stack spacing={2.75} sx={{ maxWidth: 640 }}>
          <Chip label="Discount listing brokerage" variant="filled" sx={{ alignSelf: "flex-start" }} />
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2.5rem", sm: "3.25rem", md: "4.25rem" },
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
            sx={{ fontSize: 19, maxWidth: "30em" }}
          >
            Glide RE lists your home for a flat low rate instead of the usual 3% — with
            the tools, pricing data, and real agent support to sell faster and for top
            dollar.
          </Typography>
          <Box>
            <Button href="#pricing" variant="contained" color="primary" size="large">
              See our pricing
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
