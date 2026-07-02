import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MarketingLinkButton from "@/components/marketing/MarketingLinkButton";
import { sectionAnchorSx } from "@/components/marketing/marketing-section";
import { LISTING_INTAKE_PATH } from "@/lib/consumer/listing-prefill";

const CONTACT_EMAIL = "Blair@UtahDigs.com";

export default function ContactSection() {
  const listHomeHref = LISTING_INTAKE_PATH;

  return (
    <Box
      component="section"
      id="contact"
      sx={{
        ...sectionAnchorSx,
        py: { xs: 7, md: 10 },
        backgroundColor: "primary.main",
        color: "primary.contrastText",
      }}
    >
      <Container maxWidth="md">
        <Stack
          spacing={3}
          sx={{
            textAlign: "center",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", sm: "2.5rem", md: "2.75rem" },
              color: "inherit",
            }}
          >
            Ready to keep more at closing?
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: 16, md: 18 },
              color: "rgba(255, 255, 255, 0.88)",
              maxWidth: 520,
              lineHeight: 1.6,
            }}
          >
            Start your listing in minutes, or reach out to our team with questions about
            pricing, timing, or your home&apos;s market value.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ width: { xs: "100%", sm: "auto" }, pt: 0.5 }}
          >
            <MarketingLinkButton
              href={listHomeHref}
              variant="contained"
              size="large"
              sx={{
                backgroundColor: "#fff",
                color: "primary.main",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.92)" },
                minWidth: { xs: "100%", sm: 200 },
              }}
            >
              List your home
            </MarketingLinkButton>
            <Button
              component="a"
              href={`mailto:${CONTACT_EMAIL}`}
              variant="outlined"
              size="large"
              startIcon={<EmailOutlinedIcon />}
              sx={{
                borderColor: "rgba(255, 255, 255, 0.5)",
                color: "#fff",
                "&:hover": {
                  borderColor: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                },
                minWidth: { xs: "100%", sm: 200 },
              }}
            >
              Email us
            </Button>
          </Stack>

          <Typography sx={{ fontSize: 14, color: "rgba(255, 255, 255, 0.75)" }}>
            Questions?{" "}
            <Link
              href={`mailto:${CONTACT_EMAIL}`}
              underline="hover"
              sx={{ color: "#fff", fontWeight: 600 }}
            >
              {CONTACT_EMAIL}
            </Link>
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
