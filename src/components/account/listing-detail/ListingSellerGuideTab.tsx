"use client";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  sellerGuideContact,
  sellerGuideIntro,
  sellerGuideSections,
} from "@/content/seller-guide";

export default function ListingSellerGuideTab() {
  return (
    <Stack spacing={3}>
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 2,
          borderLeft: 4,
          borderLeftColor: "primary.main",
          backgroundColor: "action.hover",
        }}
      >
        <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
          {sellerGuideIntro.label}
        </Typography>
        <Typography sx={{ mt: 1, lineHeight: 1.7 }}>{sellerGuideIntro.text}</Typography>
      </Paper>

      {sellerGuideSections.map((section) => (
        <Paper key={section.title} variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h6">{section.title}</Typography>
            {section.intro ? (
              <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {section.intro}
              </Typography>
            ) : null}

            {section.cards ? (
              <Grid container spacing={2}>
                {section.cards.map((card) => (
                  <Grid key={card.title} size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "action.hover",
                        height: "100%",
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, mb: 1 }}>{card.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {card.body}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : null}

            {section.columns ? (
              <Grid container spacing={2}>
                {section.columns.map((col) => (
                  <Grid key={col.title} size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                      {col.title}
                    </Typography>
                    {col.paragraphs.map((p) => (
                      <Typography
                        key={p}
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.7, mb: 1 }}
                      >
                        {p}
                      </Typography>
                    ))}
                    {col.callout ? (
                      <Box
                        sx={{
                          mt: 1,
                          p: 1.5,
                          borderRadius: 1,
                          backgroundColor: "action.hover",
                        }}
                      >
                        <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                          {col.callout}
                        </Typography>
                      </Box>
                    ) : null}
                  </Grid>
                ))}
              </Grid>
            ) : null}

            {section.doItems || section.dontItems ? (
              <Grid container spacing={2}>
                {section.doItems ? (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      variant="overline"
                      color="success.main"
                      sx={{ fontWeight: 700 }}
                    >
                      Do
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      {section.doItems.map((item) => (
                        <Box
                          key={item}
                          sx={{
                            p: 1.5,
                            borderRadius: 1,
                            backgroundColor: "success.light",
                            color: "success.contrastText",
                          }}
                        >
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {item}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Grid>
                ) : null}
                {section.dontItems ? (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="overline" color="error.main" sx={{ fontWeight: 700 }}>
                      Don&apos;t
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      {section.dontItems.map((item) => (
                        <Box
                          key={item}
                          sx={{
                            p: 1.5,
                            borderRadius: 1,
                            backgroundColor: "error.light",
                            color: "error.contrastText",
                          }}
                        >
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {item}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Grid>
                ) : null}
              </Grid>
            ) : null}

            {section.faqs ? (
              <Stack spacing={1}>
                {section.faqs.map((faq, index) => (
                  <Accordion
                    key={faq.question}
                    defaultExpanded={index === 0}
                    disableGutters
                    elevation={0}
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: "8px !important",
                      "&::before": { display: "none" },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontWeight: 600 }}>{faq.question}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            ) : null}

            {section.callout ? (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  borderLeft: 4,
                  borderColor: "primary.main",
                  backgroundColor: "action.hover",
                }}
              >
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{section.callout.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {section.callout.text}
                </Typography>
              </Box>
            ) : null}
          </Stack>
        </Paper>
      ))}

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
        Questions? Text or call Blair anytime —{" "}
        <Link href={sellerGuideContact.phoneHref}>{sellerGuideContact.phone}</Link> ·{" "}
        <Link href={`mailto:${sellerGuideContact.email}`}>{sellerGuideContact.email}</Link> ·{" "}
        <Link href={sellerGuideContact.website} target="_blank" rel="noopener noreferrer">
          UtahDigs.com
        </Link>
      </Typography>
    </Stack>
  );
}
