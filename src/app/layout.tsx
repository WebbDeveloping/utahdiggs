import ThemeRegistry from "@/components/providers/ThemeRegistry";
import { createRootMetadata } from "@/lib/seo/metadata";
import { archivo, fraunces } from "@/theme/fonts";
import "./globals.css";

export const metadata = createRootMetadata();

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
