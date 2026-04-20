import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CREXE — Plateforme de valorisation des projets OIF",
  description:
    "La plateforme digitale de l'Organisation internationale de la Francophonie pour visualiser, raconter et explorer l'impact des projets du CREXE 2025.",
  openGraph: {
    title: "CREXE — Plateforme OIF",
    description: "Valorisation des projets de la Francophonie — CREXE 2025",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`h-full antialiased ${inter.variable} ${sourceSerif.variable}`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
