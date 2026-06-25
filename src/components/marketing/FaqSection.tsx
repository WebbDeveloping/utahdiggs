"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import SectionHeading from "@/components/marketing/SectionHeading";
import { sectionAnchorSx } from "@/components/marketing/marketing-section";

const faqs = [
  {
    question: "How is Glide RE cheaper than a normal agent?",
    answer:
      "Traditional listing agents typically charge around 3% of your sale price. We charge a flat 1% (Virtual) or 1.5% (Full Service) and use efficient tools to do the rest — so the savings stay in your pocket.",
  },
  {
    question: "Will my home still go on the MLS and Zillow?",
    answer:
      "Yes. Both plans list your home on the local MLS and syndicate to Zillow, Redfin, Realtor.com, and the other major sites buyers actually use.",
  },
  {
    question: "What's the difference between the two plans?",
    answer:
      "Virtual (1%) gives you the full listing toolkit and agent support with a contractor key box. Full Service (1.5%) adds a staging consultation, an on-site visit from one of our agents, and a secure MLS lock box.",
  },
  {
    question: "Are your agents licensed?",
    answer:
      "Every Glide RE agent is a licensed real estate professional. You get real human help — we just skip the bloated commission.",
  },
] as const;

export default function FaqSection() {
  return (
    <Box
      component="section"
      id="faq"
      sx={{
        ...sectionAnchorSx,
        py: { xs: 7, md: 10 },
        backgroundColor: "background.default",
      }}
    >
      <Container maxWidth="md">
        <SectionHeading title="Questions, answered" />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {faqs.map((faq, index) => (
            <Accordion
              key={faq.question}
              defaultExpanded={index === 0}
              disableGutters
              elevation={0}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: "16px !important",
                backgroundColor: "background.paper",
                "&::before": { display: "none" },
                overflow: "hidden",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  px: { xs: 2, sm: 2.5 },
                  py: 0.5,
                  "& .MuiAccordionSummary-content": { my: 1.5 },
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: { xs: 2, sm: 2.5 }, pt: 0, pb: 2.5 }}>
                <Typography variant="body2" color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
