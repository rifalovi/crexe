'use client'

// ─── Barre latérale de l'interface admin ─────────────────────────────────────
// Ce composant est un Client Component car il utilise usePathname() pour
// mettre en surbrillance la route active, et gère l'ouverture/fermeture mobile.
//
// Architecture de la navigation admin :
// - Tableau de bord (vue globale)
// - Projets (liste + création + édition)
// - Programmes stratégiques
// - Utilisateurs (admin uniquement)
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

interface NavItem {
  label: string
  href: string
  icon: string
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Tableau de bord',      href: '/admin',                     icon: '◈' },
  { label: 'Éditions CREXE',      href: '/admin/editions',             icon: '◑' },
  { label: 'Import IA',           href: '/admin/import',               icon: '✦' },
  { label: 'Résultats ERA',        href: '/admin/era',                 icon: '📊' },
  { label: 'Base de connaissance', href: '/admin/base-connaissance',   icon: '◧' },
  { label: 'Demandes d\'accès',   href: '/admin/demandes',             icon: '🔑', adminOnly: true },
  { label: 'Utilisateurs',        href: '/admin/utilisateurs',         icon: '◎', adminOnly: true },
  { label: 'Paramètres',          href: '/admin/parametres',           icon: '⚙️', adminOnly: true },
]

interface Props {
  userEmail: string
  userRole: string
}

export default function AdminSidebar({ userEmail, userRole }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Filtre les items selon le rôle
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || userRole === 'admin'
  )

  return (
    <aside className="w-64 min-h-screen bg-[var(--oif-blue-dark)] flex flex-col">
      {/* En-tête de la sidebar */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--oif-gold)] flex items-center justify-center">
            <span className="text-white font-bold text-xs">OIF</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">CREXE</p>
            <p className="text-white/50 text-xs">Administration</p>
          </div>
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          // On vérifie si la route est active (exacte pour /admin, partielle sinon)
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Profil utilisateur → Mon compte */}
      <div className="px-3 py-4 border-t border-white/10">
        <Link
          href="/admin/mon-compte"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition mb-1 text-left ${
            pathname === '/admin/mon-compte'
              ? 'bg-white/15 text-white'
              : 'hover:bg-white/10 group'
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-[var(--oif-gold)] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/90 text-xs font-medium truncate group-hover:text-white transition">{userEmail}</p>
            <span className="text-white/40 text-[10px] capitalize group-hover:text-white/60 transition">{userRole} · Mon compte</span>
          </div>
          <span className="text-white/30 text-xs group-hover:text-white/60 transition">→</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:bg-white/10 hover:text-white/70 transition"
        >
          <span>⎋</span>
          Se déconnecter
        </button>
      </div>
    </aside>
  )
}
