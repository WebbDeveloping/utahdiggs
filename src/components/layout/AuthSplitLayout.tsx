import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const DEFAULT_IMAGE = "/images/hero-home.jpg";

type AuthSplitLayoutProps = {
  children: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  title?: string;
  subtitle?: string;
};

export default function AuthSplitLayout({
  children,
  imageSrc = DEFAULT_IMAGE,
  imageAlt = "Modern Utah home exterior at dusk",
  title = "Sell your home. Keep your equity.",
  subtitle = "Join Utah homeowners who list with Glide RE and save thousands on commission.",
}: AuthSplitLayoutProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        minHeight: { md: "calc(100dvh - 64px)" },
      }}
    >
      <Box
        aria-hidden
        sx={{
          display: { xs: "none", md: "block" },
          flex: 1,
          position: "relative",
          backgroundImage: `url(${imageSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.2) 55%, rgba(0, 0, 0, 0.35) 100%)",
          }}
        />
        <Stack
          spacing={1.5}
          sx={{
            position: "relative",
            height: "100%",
            justifyContent: "flex-end",
            p: { md: 5, lg: 6 },
            color: "#fff",
            maxWidth: 480,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontSize: { md: "2rem", lg: "2.5rem" },
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            {title}
          </Typography>
          <Typography sx={{ fontSize: { md: 16, lg: 18 }, color: "rgba(255, 255, 255, 0.88)" }}>
            {subtitle}
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 4 },
          py: { xs: 6, md: 4 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>{children}</Box>
      </Box>
    </Box>
  );
}
