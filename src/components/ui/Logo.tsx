import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function Logo({ variant = "light" }: { variant?: "light" | "dark" }) {
  const ink = variant === "dark" ? "#ffffff" : "#13211c";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.125,
        textDecoration: "none",
        color: "inherit",
      }}
      component="span"
    >
      <Box component="svg" width={26} height={26} viewBox="0 0 32 32" fill="none" aria-hidden>
        <path
          d="M4 18L16 6l12 12"
          stroke="#0e7a5f"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 16v10h16V16"
          stroke={ink}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Box>
      <Typography
        component="span"
        sx={{
          fontFamily: "var(--font-fraunces), Georgia, serif",
          fontWeight: 600,
          fontSize: 22,
          letterSpacing: "-0.02em",
        }}
      >
        Glide
        <Box component="span" sx={{ color: "primary.main" }}>
          {" RE"}
        </Box>
      </Typography>
    </Box>
  );
}
