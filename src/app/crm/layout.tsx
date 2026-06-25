import type { Metadata } from "next";
import Box from "@mui/material/Box";

export const metadata: Metadata = {
  title: "CRM — Glide RE",
  robots: { index: false, follow: false },
};

export default function CrmRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
