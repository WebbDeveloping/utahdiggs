import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Logo from "@/components/ui/Logo";

const footerLinks = {
  Company: [
    { label: "About", href: "#" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ],
  Resources: [
    { label: "How it works", href: "#how" },
    { label: "FAQ", href: "#faq" },
    { label: "Seller portal", href: "https://portal.utahdigs.com" },
  ],
};

export default function SiteFooter() {
  return (
    <Box
      component="footer"
      id="contact"
      sx={{
        backgroundColor: "#13211c",
        color: "#cdd6d1",
        pt: 6.75,
        pb: 3.75,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Logo variant="dark" />
            <Typography sx={{ mt: 2, fontSize: 14.5, color: "#aab8b1", maxWidth: 280 }}>
              Discount listing brokerage helping Utah sellers keep more equity at closing.
            </Typography>
          </Grid>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <Grid key={heading} size={{ xs: 6, md: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  color: "#fff",
                  fontSize: 14,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  mb: 1.75,
                  fontFamily: "var(--font-archivo), system-ui, sans-serif",
                }}
              >
                {heading}
              </Typography>
              <Stack spacing={0.5}>
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    underline="none"
                    sx={{
                      color: "#aab8b1",
                      fontSize: 14.5,
                      "&:hover": { color: "#fff" },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Typography sx={{ fontSize: 13, color: "#7a8a82", borderTop: "1px solid #2a3832", pt: 2 }}>
          © {new Date().getFullYear()} Glide RE. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
