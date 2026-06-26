"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { PropertyDetailSection } from "@/lib/search/map-intake-to-property-details";

type ListingPropertyDetailsProps = {
  sections: PropertyDetailSection[];
  sx?: { mt?: number };
};

export default function ListingPropertyDetails({ sections, sx }: ListingPropertyDetailsProps) {
  if (sections.length === 0) return null;

  return (
    <Stack spacing={1.5} sx={{ mt: sx?.mt ?? 0 }}>
      {sections.map((section) => (
        <Accordion
          key={section.title}
          disableGutters
          elevation={0}
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: "12px !important",
            backgroundColor: "background.paper",
            "&::before": { display: "none" },
            overflow: "hidden",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 2,
              py: 0.5,
              "& .MuiAccordionSummary-content": { my: 1.25 },
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {section.title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
            <Stack component="ul" spacing={2} sx={{ listStyle: "none", m: 0, p: 0 }}>
              {section.items.map((item) => (
                <Box component="li" key={`${section.title}-${item.label}`}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
}
