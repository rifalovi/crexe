// ─── Dashboard Lecteur — Mes projets assignés ────────────────────────────────
// Affiche les projets dont le lecteur est bénéficiaire, avec accès CREX et ERA.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

async function getMesProjets() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { projets: [], profil: null }

  const { data: profil } = await supabase
    .from('profils')
    .select('role, nom_complet, email')
    .eq('id', user.id)
    .maybeSingle()

  // Admin et éditeurs voient tous les projets ; lecteurs voient leurs projets assignés
  let projets: { id: string; nom: string; code_officiel: string; statut: string; programme?: string; couleur?: string }[] = []

  if (profil?.role === 'admin') {
    const { data } = await supabase
      .from('projets')
      .select('id, nom, code_officiel, statut, programmes_strategiques(titre, couleur_theme)')
      .in('statut', ['publie', 'en_revue', 'brouillon'])
      .order('code_officiel')
    projets = (data || []).map((p: Record<string, unknown>) => ({
      id: p.id as string,
      nom: p.nom as string,
      code_officiel: p.code_officiel as string,
      statut: p.statut as string,
      programme: (p.programmes_strategiques as Record<string, unknown>)?.titre as string,
      couleur: (p.programmes_strategiques as Record<string, unknown>)?.couleur_theme as string,
    }))
  } else {
    // Lecteurs : projets via assignations_editeur (réutilise la même table pour simplifier)
    const { data } = await supabase
      .from('assignations_editeur')
      .select('projet_id, projets(id, nom, code_officiel, statut, programmes_strategiques(titre, couleur_theme))')
      .eq('editeur_id', user.id)
    projets = (data || []).map((a: Record<string, unknown>) => {
      const p = a.projets as Record<string, unknown>
      return {
        id: p.id as string,
        nom: p.nom as string,
        code_officiel: p.code_officiel as string,
        statut: p.statut as string,
        programme: (p.programmes_strategiques as Record<string, unknown>)?.titre as string,
        couleur: (p.programmes_strategiques as Record<string, unknown>)?.couleur_theme as string,
      }
    })
  }

  return { projets, profil }
}

export default async function LecteurDashboard() {
  const { projets, profil } = await getMesProjets()

  return (
    <div>
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="font-editorial text-3xl font-semibold text-[var(--oif-blue-dark)] mb-2">
          Bonjour, {profil?.nom_complet?.split(' ')[0] || 'Collègue'} 👋
        </h1>
        <p className="text-gray-500 text-sm">
          Voici les projets qui vous ont été affectés. Consultez les données CREXE et les résultats ERA.
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Projets affectés', value: String(projets.length), color: 'var(--oif-blue)' },
          { label: 'Avec résultats ERA', value: '—', color: '#B83A2D' },
          { label: 'CREX 2025', value: projets.filter(p => p.statut === 'publie').length > 0 ? String(projets.filter(p => p.statut === 'publie').length) : '—', color: 'var(--oif-green)' },
          { label: 'Édition active', value: '2025', color: 'var(--oif-purple)' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-2xl font-editorial font-bold mb-1" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Liste des projets */}
      {projets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-[var(--oif-neutral)] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
              <path strokeLinecap="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Aucun projet ne vous a encore été affecté.</p>
          <p className="text-gray-400 text-xs mt-1">Contactez l&apos;administrateur pour obtenir un accès.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {projets.map((projet) => (
            <div key={projet.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:border-[var(--oif-blue)]/30 transition-colors">
              <div className="px-5 py-4 flex items-center gap-4">
                {/* Badge code */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold"
                  style={{ backgroundColor: projet.couleur || 'var(--oif-blue)' }}
                >
                  {projet.code_officiel?.replace('PROJ_', '') || '—'}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{projet.nom}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{projet.programme || 'Programme stratégique'}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/lecteur/projets/${projet.id}`}
                    className="text-xs bg-[var(--oif-blue)]/8 text-[var(--oif-blue)] hover:bg-[var(--oif-blue)]/15 font-medium px-3 py-1.5 rounded-lg transition"
                  >
                    CREX
                  </Link>
                  <Link
                    href={`/lecteur/resultats-era/${projet.id}`}
                    className="text-xs bg-[#B83A2D]/8 text-[#B83A2D] hover:bg-[#B83A2D]/15 font-medium px-3 py-1.5 rounded-lg transition"
                  >
                    ERA
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
