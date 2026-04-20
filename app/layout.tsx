import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import PwaInstallPrompt from "@/components/shared/PwaInstallPrompt";

// ─── Polices ─────────────────────────────────────────────────────────────────
// Inter : interface, labels, données
// Source Serif 4 : titres éditoriaux, citations, chiffres-chocs
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  style: ["normal", "italic"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CREXE — Plateforme de valorisation des projets OIF",
  description:
    "La plateforme digitale de l'Organisation internationale de la Francophonie pour visualiser, raconter et explorer l'impact des projets du CREXE 2025.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CREXE 2025",
  },
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
    <html lang="fr" className={`h-full antialiased ${inter.variable} ${sourceSerif.variable}`}>
      <head>
        {/* ─── PWA / Installable App ──────────────────────────────────────── */}
        {/* theme-color : couleur de la barre de navigation sur mobile */}
        <meta name="theme-color" content="#042C53" />
        {/* Apple touch icon pour iOS */}
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
        {/* Masquer l'URL bar sur iOS en mode standalone */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CREXE 2025" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        {/* Invite d'installation PWA — affichée de façon non-intrusive */}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
