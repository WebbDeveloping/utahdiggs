"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import NextLink from "next/link";

export type AppShellNavPillItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
};

type AppShellNavPillsProps = {
  items: AppShellNavPillItem[];
  basePath: string;
};

function isActive(pathname: string, href: string, basePath: string) {
  return href === basePath ? pathname === basePath : pathname.startsWith(href);
}

export default function AppShellNavPills({ items, basePath }: AppShellNavPillsProps) {
  const pathname = usePathname();
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [pathname]);

  return (
    <Box
      sx={{
        display: { xs: "block", md: "none" },
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 1,
          overflowX: "auto",
          flexWrap: "nowrap",
          px: 2,
          py: 1.5,
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {items.map((item) => {
          const active = isActive(pathname, item.href, basePath);

          return (
            <Button
              key={item.href}
              component={NextLink}
              href={item.href}
              ref={active ? activeRef : undefined}
              size="small"
              startIcon={item.icon}
              variant={active ? "contained" : "outlined"}
              disableElevation
              sx={{
                flexShrink: 0,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: active ? 600 : 500,
                fontSize: 14,
                whiteSpace: "nowrap",
                ...(active
                  ? {
                      backgroundColor: "primary.light",
                      color: "primary.dark",
                      "&:hover": { backgroundColor: "primary.light" },
                      "& .MuiButton-startIcon": { color: "primary.main" },
                    }
                  : {
                      borderColor: "divider",
                      color: "text.primary",
                      "& .MuiButton-startIcon": { color: "text.secondary" },
                    }),
              }}
            >
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                <span>{item.label}</span>
                {item.badge}
              </Stack>
            </Button>
          );
        })}
      </Box>
    </Box>
  );
}
