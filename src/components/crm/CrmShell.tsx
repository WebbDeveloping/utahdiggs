"use client";

import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import NextLink from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";
import Logo from "@/components/ui/Logo";
import { formatUserRole, type CrmUserRole } from "@/lib/crm/roles";

const DRAWER_WIDTH = 260;

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  soon?: boolean;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/crm", icon: <DashboardOutlinedIcon /> },
  { label: "Listings", href: "/crm/listings", icon: <HomeWorkOutlinedIcon /> },
  { label: "Offers", href: "/crm/offers", icon: <LocalOfferOutlinedIcon />, soon: true },
  { label: "Seller requests", href: "/crm/requests", icon: <InboxOutlinedIcon />, soon: true },
];

type CrmShellProps = {
  user: {
    name?: string | null;
    email: string;
    role: CrmUserRole;
  };
  children: React.ReactNode;
};

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <List sx={{ px: 1.5, py: 1 }}>
      {navItems.map((item) => {
        const active =
          item.href === "/crm"
            ? pathname === "/crm"
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
            {item.soon ? (
              <Chip label="Soon" size="small" variant="outlined" sx={{ height: 22, fontSize: 11 }} />
            ) : null}
          </ListItemButton>
        );
      })}
    </List>
  );
}

function SidebarContent({
  user,
  onNavigate,
}: {
  user: CrmShellProps["user"];
  onNavigate?: () => void;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ px: 2.5, minHeight: 72 }}>
        <Logo />
      </Toolbar>

      <Box sx={{ px: 2.5, pb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.12em" }}>
          CRM
        </Typography>
      </Box>

      <SidebarNav onNavigate={onNavigate} />

      <Box sx={{ mt: "auto", p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ px: 1, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user.name ?? user.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatUserRole(user.role)}
          </Typography>
        </Box>
        <ListItemButton
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
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
  );
}

export default function CrmShell({ user, children }: CrmShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="CRM navigation"
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
          <SidebarContent user={user} onNavigate={() => setMobileOpen(false)} />
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

        <Box sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
