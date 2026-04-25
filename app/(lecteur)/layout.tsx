// ─── Layout espace lecteur ────────────────────────────────────────────────────
// Protégé par middleware : seuls les utilisateurs avec rôle 'lecteur' ou 'admin'
// peuvent accéder aux routes /lecteur/*.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getLecteur() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const authRes = await supabase.auth.getUser()
    const user = authRes.data?.user
    if (!user) redirect('/login?redirect=/lecteur')

    const { data: profil } = await supabase
      .from('profils')
      .select('role, nom_complet, email')
      .eq('id', user.id)
      .maybeSingle()

    if (!profil || !['lecteur', 'editeur', 'admin'].includes(profil.role ?? '')) {
      redirect('/login?redirect=/lecteur')
    }
    return { user, profil }
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((err as any)?.digest?.startsWith('NEXT_REDIRECT')) throw err
    redirect('/login')
  }
}

export default async function LecteurLayout({ children }: { children: React.ReactNode }) {
  const { profil } = await getLecteur()

  return (
    <div className="min-h-screen bg-[var(--oif-neutral)]">
      {/* ─── Barre lecteur ─────────────────────────────────────────── */}
      <nav className="bg-[var(--oif-blue-dark)] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-[var(--oif-gold)] flex items-center justify-center">
              <span className="text-white font-black text-xs">OIF</span>
            </div>
            <span className="text-white font-semibold text-sm">
              CREXE <span className="text-white/40 font-normal">2025</span>
            </span>
            <span className="hidden sm:inline text-white/20 text-sm">·</span>
            <span className="hidden sm:inline text-white/50 text-xs">Espace lecteur</span>
          </div>

          <div className="hidden md:flex items-center gap-5 text-sm">
            <Link href="/lecteur" className="text-white/70 hover:text-white transition">
              Mes projets
            </Link>
            <Link href="/lecteur/resultats-era" className="text-white/70 hover:text-white transition">
              Résultats ERA
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 hidden sm:block">
              {profil.nom_complet || profil.email}
            </span>
            <form action="/api/auth/logout" method="POST">
              <button className="text-xs text-white/40 hover:text-white/70 transition border border-white/20 px-3 py-1.5 rounded-lg">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>
    </div>
  )
}
