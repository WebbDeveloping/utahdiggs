import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type LegalSection = {
  title: string;
  paragraphs: string[];
};

type LegalPageContentProps = {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export function LegalPageContent({
  title,
  updated,
  intro,
  sections,
}: LegalPageContentProps) {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: { xs: "2.25rem", md: "3rem" }, mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last updated: {updated}
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ fontSize: 18, lineHeight: 1.7 }}>
          {intro}
        </Typography>

        <Stack spacing={3.5} component="article">
          {sections.map((section) => (
            <Box key={section.title}>
              <Typography variant="h3" sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" }, mb: 1.5 }}>
                {section.title}
              </Typography>
              <Stack spacing={1.5}>
                {section.paragraphs.map((paragraph) => (
                  <Typography
                    key={paragraph}
                    variant="body1"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7 }}
                  >
                    {paragraph}
                  </Typography>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
