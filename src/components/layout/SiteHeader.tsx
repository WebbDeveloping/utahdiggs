"use client";

import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import NextLink from "next/link";
import Logo from "@/components/ui/Logo";
import type { SiteUser } from "@/components/layout/SitePageLayout";
import { consumerSignOutAction } from "@/lib/consumer/actions";
import { LISTING_INTAKE_PATH } from "@/lib/consumer/listing-prefill";

const navLinks = [
  { label: "Search homes", href: "/search" },
  { label: "Pricing", href: "/#pricing" },
  { label: "How it works", href: "/#how" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
];

function getInitials(user: SiteUser): string {
  if (user.name?.trim()) {
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  return user.email.slice(0, 2).toUpperCase();
}

type SiteHeaderProps = {
  user?: SiteUser | null;
};

export default function SiteHeader({ user = null }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);
  const listHomeHref = user ? LISTING_INTAKE_PATH : "/sell/inquiry";

  const authControls = user ? (
    <>
      <IconButton
        onClick={(event) => setMenuAnchor(event.currentTarget)}
        aria-label="Account menu"
        sx={{ p: 0.5 }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: "primary.main",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {getInitials(user)}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { minWidth: 200, mt: 1 } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ fontWeight: 600, fontSize: 14 }}>
            {user.name?.trim() || "Account"}
          </Box>
          <Box sx={{ fontSize: 13, color: "text.secondary" }}>{user.email}</Box>
        </Box>
        <Divider />
        <MenuItem
          component={NextLink}
          href="/account"
          onClick={() => setMenuAnchor(null)}
        >
          <ListItemIcon>
            <PersonOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Account</ListItemText>
        </MenuItem>
        <Box component="form" action={consumerSignOutAction}>
          <MenuItem component="button" type="submit" sx={{ width: "100%" }}>
            <ListItemIcon>
              <LogoutOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Sign out</ListItemText>
          </MenuItem>
        </Box>
      </Menu>
    </>
  ) : (
    <Button component={NextLink} href="/login" variant="outlined" color="inherit">
      Sign in
    </Button>
  );

  const closeMobileMenu = () => setMobileOpen(false);

  const navContent = (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={{ xs: 2, md: 3.5 }}
      sx={{ alignItems: { xs: "flex-start", md: "center" } }}
    >
      {navLinks.map((link) => (
        <Link
          key={link.href}
          component={NextLink}
          href={link.href}
          underline="none"
          color="text.secondary"
          onClick={closeMobileMenu}
          sx={{
            fontSize: 15,
            fontWeight: 500,
            "&:hover": { color: "text.primary" },
          }}
        >
          {link.label}
        </Link>
      ))}
      <Button
        component={NextLink}
        href={listHomeHref}
        variant="contained"
        color="primary"
        onClick={closeMobileMenu}
      >
        List your home
      </Button>
      {authControls}
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
