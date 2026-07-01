"use client";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ONBOARDING_EXPECTATIONS } from "@/content/onboarding-expectations";

export default function OnboardingExpectations() {
  return (
    <Stack spacing={1} id="expectations">
      {ONBOARDING_EXPECTATIONS.map((module, index) => (
        <Accordion
          key={module.id}
          defaultExpanded={index === 0}
          disableGutters
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "8px !important",
            "&:before": { display: "none" },
            mb: 0,
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600 }}>{module.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              {module.body}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
}
