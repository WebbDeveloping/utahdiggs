"use client";

import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import NextLink from "next/link";
import Logo from "@/components/ui/Logo";

const navLinks = [
  { label: "Search homes", href: "/search" },
  { label: "Pricing", href: "#pricing" },
  { label: "How it works", href: "#how" },
  { label: "FAQ", href: "#faq" },
];

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={{ xs: 2, md: 3.5 }}
      sx={{ alignItems: { xs: "flex-start", md: "center" } }}
    >
      {navLinks.map((link) =>
        link.href.startsWith("/") ? (
          <Link
            key={link.href}
            component={NextLink}
            href={link.href}
            underline="none"
            color="text.secondary"
            sx={{
              fontSize: 15,
              fontWeight: 500,
              "&:hover": { color: "text.primary" },
            }}
          >
            {link.label}
          </Link>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            underline="none"
            color="text.secondary"
            sx={{
              fontSize: 15,
              fontWeight: 500,
              "&:hover": { color: "text.primary" },
            }}
          >
            {link.label}
          </Link>
        ),
      )}
      <Button component={NextLink} href="/sell/inquiry" variant="contained" color="primary">
        List your home
      </Button>
    </Stack>
  );

  return (
    <>
      <AppBar position="sticky" color="transparent">
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ height: 68, justifyContent: "space-between" }}>
            <Link component={NextLink} href="/" underline="none" color="inherit">
              <Logo />
            </Link>

            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
              {navContent}
            </Box>

            <IconButton
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: "flex", md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              p: 3,
              backgroundColor: "background.default",
            },
          },
        }}
      >
        {navContent}
      </Drawer>
    </>
  );
}
