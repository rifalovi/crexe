import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
