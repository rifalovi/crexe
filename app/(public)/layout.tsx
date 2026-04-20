// Layout partagé par toutes les routes publiques (hors landing) :
// /projets, /projets/[id], /explorer, /a-propos…
// Fournit la nav + le footer + le chatbot SCS pour toutes les pages publiques.

import { NavOIF } from '@/components/shared/NavOIF'
import { FooterOIF } from '@/components/shared/FooterOIF'
import ChatWidget from '@/components/chat/ChatWidget'

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
      {/* Assistant SCS — chatbot RAG disponible sur toutes les pages */}
      <ChatWidget />
    </>
  )
}
