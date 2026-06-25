import type { Metadata } from "next";
import ThemeRegistry from "@/components/providers/ThemeRegistry";
import { archivo, fraunces } from "@/theme/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Glide RE — Sell smarter. Keep more.",
  description:
    "Glide RE lists your home for a flat low rate instead of the usual 3% — with the tools, pricing data, and real agent support to sell faster and for top dollar.",
  metadataBase: new URL("https://glidere.com"),
  openGraph: {
    title: "Glide RE — Sell smarter. Keep more.",
    description:
      "Glide RE lists your home for a flat low rate instead of the usual 3% — with the tools, pricing data, and real agent support to sell faster and for top dollar.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${archivo.variable}`}>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
