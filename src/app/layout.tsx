import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FC Clubs Builder | Pro Clubs Build Calculator",
  description:
    "Build simulator and calculator for EA SPORTS FC Pro Clubs. Tune height and weight, adjust attributes, equip PlayStyles and work out the exact Attribute Point (AP) cost.",
};

export const viewport: Viewport = {
  themeColor: "#0d0f12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}