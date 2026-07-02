"use client";

import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DoorFrontOutlinedIcon from "@mui/icons-material/DoorFrontOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import NextLink from "next/link";
import { useState } from "react";
import Logo from "@/components/ui/Logo";
import AppShellNavPills from "@/components/layout/AppShellNavPills";
import { consumerSignOutAction } from "@/lib/consumer/actions";

const DRAWER_WIDTH = 260;

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { label: "Overview", href: "/account", icon: <DashboardOutlinedIcon /> },
  { label: "My listings", href: "/account/listings", icon: <HomeWorkOutlinedIcon /> },
  {
    label: "This week's report",
    href: "/account/this-weeks-report",
    icon: <AssessmentOutlinedIcon />,
  },
  { label: "Offers", href: "/account/offers", icon: <LocalOfferOutlinedIcon /> },
  { label: "Showings", href: "/account/showings", icon: <DoorFrontOutlinedIcon /> },
  { label: "Web traffic", href: "/account/web-traffic", icon: <AnalyticsOutlinedIcon /> },
  { label: "Your market", href: "/account/your-market", icon: <TrendingUpOutlinedIcon /> },
  { label: "Seller guide", href: "/account/seller-guide", icon: <MenuBookOutlinedIcon /> },
  { label: "Documents", href: "/account/documents", icon: <DescriptionOutlinedIcon /> },
  {
    label: "Seller requests",
    href: "/account/seller-requests",
    icon: <InboxOutlinedIcon />,
  },
];

type AccountAppShellProps = {
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
  children: React.ReactNode;
};

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <List sx={{ px: 1.5, py: 1 }}>
      {navItems.map((item) => {
        const active =
          item.href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(item.href);

        return (
          <ListItemButton
            key={item.href}
            component={NextLink}
            href={item.href}
            selected={active}
            onClick={onNavigate}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              "&.Mui-selected": {
                backgroundColor: "primary.light",
                color: "primary.dark",
                "& .MuiListItemIcon-root": { color: "primary.main" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "text.secondary" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              sx={{
                "& .MuiListItemText-primary": {
                  fontWeight: active ? 600 : 500,
                  fontSize: 15,
                },
              }}
            />
          </ListItemButton>
        );
      })}
    </List>
  );
}

function SidebarContent({
  user,
  onNavigate,
  onClose,
}: {
  user: AccountAppShellProps["user"];
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const displayName = user.name?.trim() || user.email;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ px: 2.5, minHeight: 72, justifyContent: "space-between" }}>
        <Logo />
        {onClose ? (
          <IconButton aria-label="Close navigation" onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        ) : null}
      </Toolbar>

      <Box sx={{ px: 2.5, pb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.12em" }}>
          Account
        </Typography>
      </Box>

      <SidebarNav onNavigate={onNavigate} />

      <Box sx={{ mt: "auto", p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ px: 1, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
        <Box component="form" action={consumerSignOutAction}>
          <ListItemButton
            type="submit"
            sx={{
              borderRadius: 2,
              color: "text.secondary",
              "&:hover": { color: "error.main", backgroundColor: "error.light" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
              <LogoutOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Sign out" />
          </ListItemButton>
        </Box>
      </Box>
    </Box>
  );
}

export default function AccountAppShell({ user, children }: AccountAppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="Account navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          slotProps={{ root: { keepMounted: true } }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
        >
          <SidebarContent
            user={user}
            onNavigate={() => setMobileOpen(false)}
            onClose={() => setMobileOpen(false)}
          />
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              borderRight: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
            },
          }}
          open
        >
          <SidebarContent user={user} />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minWidth: 0,
        }}
      >
        <Toolbar
          sx={{
            display: { xs: "flex", md: "none" },
            px: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <IconButton
            edge="start"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <Logo />
        </Toolbar>

        <AppShellNavPills
          items={navItems.map(({ label, href, icon }) => ({ label, href, icon }))}
          basePath="/account"
        />

        <Box sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
