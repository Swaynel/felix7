/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "feli7xrescent - official site",
    template: "%s | feli7xrescent",
  },
  description:
    "Official site of feli7xrescent. New LP Vesper Hour out now. Music, tour dates, shop, EPK, press, and booking.",
  openGraph: {
    title: "feli7xrescent",
    description: "Industrial liturgy and crimson static. New LP out now.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "feli7xrescent",
    description: "Industrial liturgy and crimson static. New LP out now.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Pirata+One&family=Public+Sans:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
