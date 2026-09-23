import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clubs Build Calculator | EA SPORTS FC Pro Clubs",
  description:
    "Simulador y constructor de builds para Clubes Pro de EA SPORTS FC. Calibra altura y peso, ajusta atributos y calcula el coste exacto en Puntos de Atributo (AP).",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
