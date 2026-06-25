import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const trustItems = [
  "★★★★★ Loved by local sellers",
  "Listed on the MLS, Zillow, Redfin & more",
  "Real licensed agents",
  "No hidden fees",
];

export default function TrustStrip() {
  return (
    <Box
      component="section"
      sx={{
        borderTop: 1,
        borderBottom: 1,
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction="row"
          sx={{
            flexWrap: "wrap",
            justifyContent: "center",
            gap: { xs: 2, md: 5.75 },
            py: 2.75,
          }}
        >
          {trustItems.map((item) => (
            <Typography
              key={item}
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.03em",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {item.startsWith("★") ? null : (
                <Box
                  component="span"
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "primary.main",
                    flexShrink: 0,
                  }}
                />
              )}
              {item}
            </Typography>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
