"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import LinkButton from "@/components/ui/LinkButton";
import {
  AFTER_LIVE_POINTS,
  APPROVE_CHECKLIST,
  GLOSSARY,
  HOW_IT_WORKS_NAV,
  JOURNEY_STEPS,
  ROLE_CARDS,
  STATUS_ITEMS,
  type HowItWorksSectionId,
} from "@/content/crm-how-it-works";

const OWNER_COLOR: Record<(typeof JOURNEY_STEPS)[number]["owner"], "default" | "primary" | "success"> =
  {
    Seller: "default",
    Team: "primary",
    Both: "success",
  };

function SectionAnchor({ id, children }: { id: HowItWorksSectionId; children: React.ReactNode }) {
  return (
    <Box
      component="section"
      id={id}
      sx={{
        scrollMarginTop: { xs: 120, md: 32 },
        mb: { xs: 4, md: 5 },
      }}
    >
      {children}
    </Box>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="h4" sx={{ fontSize: { xs: "1.35rem", sm: "1.5rem" } }}>
        {title}
      </Typography>
      {subtitle ? (
        <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 640 }}>
          {subtitle}
        </Typography>
      ) : null}
    </Box>
  );
}

export default function CrmHowItWorksGuide() {
  const [activeId, setActiveId] = useState<HowItWorksSectionId>("purpose");

  useEffect(() => {
    const elements = HOW_IT_WORKS_NAV.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target.id as HowItWorksSectionId | undefined;
        if (top) setActiveId(top);
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.15, 0.4, 0.7],
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: HowItWorksSectionId) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: { xs: 3, md: 4 },
        alignItems: { md: "flex-start" },
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: { xs: 0, md: 24 },
          zIndex: 2,
          flexShrink: 0,
          width: { md: 240, lg: 260 },
          alignSelf: { md: "flex-start" },
          // Bleed to shell edges on mobile so the sticky bar feels full-width.
          mx: { xs: -2.5, sm: -3, md: 0 },
          px: { xs: 2.5, sm: 3, md: 0 },
          py: { xs: 1.5, md: 0 },
          backgroundColor: { xs: "background.default", md: "transparent" },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ px: 1, letterSpacing: "0.12em", display: "block", mb: 0.5 }}
          >
            On this page
          </Typography>
          <Stack
            direction={{ xs: "row", md: "column" }}
            spacing={0.5}
            sx={{
              overflowX: { xs: "auto", md: "visible" },
              pb: { xs: 0.5, md: 0 },
              mx: { xs: -0.5, md: 0 },
              px: { xs: 0.5, md: 0 },
            }}
          >
            {HOW_IT_WORKS_NAV.map((item) => {
              const active = activeId === item.id;
              return (
                <Box
                  key={item.id}
                  component="button"
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  sx={{
                    textAlign: "left",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: 2,
                    px: 1.25,
                    py: 1,
                    font: "inherit",
                    fontSize: 14,
                    fontWeight: active ? 600 : 500,
                    color: active ? "primary.dark" : "text.secondary",
                    backgroundColor: active ? "primary.light" : "transparent",
                    whiteSpace: { xs: "nowrap", md: "normal" },
                    flexShrink: 0,
                    transition: "background-color 120ms ease, color 120ms ease",
                    "&:hover": {
                      backgroundColor: active ? "primary.light" : "action.hover",
                      color: active ? "primary.dark" : "text.primary",
                    },
                  }}
                >
                  {item.label}
                </Box>
              );
            })}
          </Stack>
        </Paper>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <SectionAnchor id="purpose">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              border: "1px solid",
              borderColor: "divider",
              background:
                "linear-gradient(135deg, rgba(14,122,95,0.08) 0%, rgba(246,244,238,0.9) 45%, #fff 100%)",
            }}
          >
            <Typography variant="overline" color="primary.dark" sx={{ letterSpacing: "0.14em" }}>
              What Glide RE is for
            </Typography>
            <Typography
              variant="h4"
              sx={{
                mt: 1,
                mb: 1.5,
                fontSize: { xs: "1.4rem", sm: "1.65rem" },
                maxWidth: 720,
              }}
            >
              Help Utah sellers list at a low commission, go live on the MLS correctly, and know
              whether their price is working.
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 680 }}>
              This guide is for the team — not engineers. Use it to see the full path from first
              contact to Active listing, who owns each handoff, and what “done” means.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3 }}>
              <LinkButton href="/crm/mls-queue" variant="contained" size="small">
                Open MLS Queue
              </LinkButton>
              <LinkButton href="/crm/calls" variant="outlined" size="small">
                Upcoming calls
              </LinkButton>
            </Stack>
          </Paper>
        </SectionAnchor>

        <SectionAnchor id="journey">
          <SectionTitle
            title="The journey"
            subtitle="One path from inquiry to sold. Seller steps first; team steps unlock go-live."
          />
          <Stack spacing={0}>
            {JOURNEY_STEPS.map((item, index) => {
              const isLast = index === JOURNEY_STEPS.length - 1;
              return (
                <Box
                  key={item.step}
                  sx={{ display: "flex", gap: 2, position: "relative" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: 40,
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "primary.light",
                        color: "primary.dark",
                        fontWeight: 700,
                        fontSize: 14,
                        zIndex: 1,
                      }}
                    >
                      {item.step}
                    </Box>
                    {!isLast ? (
                      <Box
                        sx={{
                          width: 2,
                          flex: 1,
                          minHeight: 20,
                          bgcolor: "divider",
                          my: 0.5,
                        }}
                      />
                    ) : null}
                  </Box>
                  <Paper
                    elevation={0}
                    sx={{
                      flex: 1,
                      p: 2.25,
                      mb: isLast ? 0 : 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      sx={{ mb: 0.75, alignItems: { sm: "center" }, justifyContent: "space-between" }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={item.owner}
                        color={OWNER_COLOR[item.owner]}
                        variant={item.owner === "Seller" ? "outlined" : "filled"}
                        sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {item.body}
                    </Typography>
                    {item.where ? (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 1.25, letterSpacing: "0.02em" }}
                      >
                        Where: {item.where}
                      </Typography>
                    ) : null}
                  </Paper>
                </Box>
              );
            })}
          </Stack>
        </SectionAnchor>

        <SectionAnchor id="roles">
          <SectionTitle
            title="Who does what"
            subtitle="Clear ownership keeps listings from stalling between seller submit and MLS go-live."
          />
          <Grid container spacing={2}>
            {ROLE_CARDS.map((card) => (
              <Grid key={card.role} size={{ xs: 12, sm: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    height: "100%",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {card.role}
                  </Typography>
                  <Typography variant="body2" color="primary.dark" sx={{ mt: 0.25, mb: 1.5 }}>
                    {card.focus}
                  </Typography>
                  <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 2.25 }}>
                    {card.responsibilities.map((line) => (
                      <Typography
                        key={line}
                        component="li"
                        variant="body2"
                        color="text.secondary"
                      >
                        {line}
                      </Typography>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </SectionAnchor>

        <SectionAnchor id="approve">
          <SectionTitle
            title="Go-live checklist"
            subtitle="This is the make-or-break handoff. Approving without Matrix + MLS# means the listing is not truly live."
          />
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3 },
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              When an intake is in the MLS Queue: enter it in Matrix, then approve in CRM with
              every item below checked.
            </Typography>
            <Stack spacing={1.25}>
              {APPROVE_CHECKLIST.map((item) => (
                <Stack key={item} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                  <CheckCircleOutlinedIcon
                    sx={{ color: "primary.main", fontSize: 22, mt: "1px" }}
                  />
                  <Typography variant="body2">{item}</Typography>
                </Stack>
              ))}
            </Stack>
            <Box sx={{ mt: 3 }}>
              <LinkButton href="/crm/mls-queue" variant="outlined" size="small">
                Go to MLS Queue
              </LinkButton>
            </Box>
          </Paper>
        </SectionAnchor>

        <SectionAnchor id="after-live">
          <SectionTitle
            title="After go-live"
            subtitle="Once Active, the seller portal becomes the coach — and Overview is the front door."
          />
          <Grid container spacing={2}>
            {AFTER_LIVE_POINTS.map((point) => (
              <Grid key={point.title} size={{ xs: 12, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    height: "100%",
                    border: "1px solid",
                    borderColor: "divider",
                    borderTop: "3px solid",
                    borderTopColor: "primary.main",
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    {point.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {point.body}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </SectionAnchor>

        <SectionAnchor id="status">
          <SectionTitle
            title="Live vs coming soon"
            subtitle="So the team does not hunt for tools that are not ready yet."
          />
          <Stack spacing={1.25}>
            {STATUS_ITEMS.map((item) => (
              <Paper
                key={item.label}
                elevation={0}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.5,
                  alignItems: { sm: "center" },
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.note}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={item.state === "live" ? "Live" : "Soon"}
                  color={item.state === "live" ? "success" : "default"}
                  variant={item.state === "live" ? "filled" : "outlined"}
                  sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                />
              </Paper>
            ))}
          </Stack>
        </SectionAnchor>

        <SectionAnchor id="glossary">
          <SectionTitle
            title="Glossary"
            subtitle="Handy words you’ll see in the CRM and seller app."
          />
          <Paper
            elevation={0}
            sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}
          >
            {GLOSSARY.map((item, index) => (
              <Box
                key={item.term}
                sx={{
                  px: { xs: 2, sm: 2.5 },
                  py: 2,
                  borderTop: index === 0 ? "none" : "1px solid",
                  borderColor: "divider",
                  display: "grid",
                  gap: 0.75,
                  gridTemplateColumns: { sm: "200px 1fr" },
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {item.term}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.definition}
                </Typography>
              </Box>
            ))}
          </Paper>
        </SectionAnchor>
      </Box>
    </Box>
  );
}
