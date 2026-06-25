import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type SectionHeadingProps = {
  title: string;
  description?: string;
  align?: "center" | "left";
};

export default function SectionHeading({
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  return (
    <Stack
      spacing={1.5}
      sx={{
        textAlign: align,
        maxWidth: align === "center" ? 640 : undefined,
        mx: align === "center" ? "auto" : undefined,
        mb: { xs: 4, md: 5 },
      }}
    >
      <Typography
        variant="h2"
        sx={{ fontSize: { xs: "2rem", sm: "2.5rem", md: "2.75rem" } }}
      >
        {title}
      </Typography>
      {description ? (
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: 16, md: 18 } }}>
          {description}
        </Typography>
      ) : null}
    </Stack>
  );
}
