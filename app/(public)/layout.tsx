// Layout partagé par toutes les routes publiques (hors landing) :
// /projets, /projets/[id], /explorer, /a-propos…
// Fournit la nav + le footer pour garder un cadre institutionnel cohérent.

import { NavOIF } from '@/components/shared/NavOIF'
import { FooterOIF } from '@/components/shared/FooterOIF'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <NavOIF />
      <main className="flex-1 bg-white">{children}</main>
      <FooterOIF />
    </>
  )
}
