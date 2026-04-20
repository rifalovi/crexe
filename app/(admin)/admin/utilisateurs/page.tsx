// ─── Gestion des utilisateurs ────────────────────────────────────────────────
// Page réservée aux admins. Affiche la liste des profils enregistrés
// et permet de modifier leur rôle.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import UtilisateursClient from './UtilisateursClient'

async function getUtilisateurs() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  // Vérification que l'utilisateur est admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profils')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/admin')

  const { data: utilisateurs } = await supabase
    .from('profils')
    .select('id, email, nom_complet, role, actif, created_at')
    .order('created_at', { ascending: false })

  return utilisateurs ?? []
}

export default async function UtilisateursPage() {
  const utilisateurs = await getUtilisateurs()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--oif-blue-dark)]">Utilisateurs</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Gérez les accès à l&apos;interface d&apos;administration
        </p>
      </div>

      {/* Explication des rôles */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            role: 'Admin',
            desc: 'Accès complet. Peut créer, modifier, supprimer et gérer les utilisateurs.',
            color: 'bg-red-50 border-red-100 text-red-700',
          },
          {
            role: 'Éditeur',
            desc: 'Peut créer et modifier les projets, indicateurs, et témoignages.',
            color: 'bg-blue-50 border-blue-100 text-blue-700',
          },
          {
            role: 'Lecteur',
            desc: 'Accès en lecture seule à la plateforme publique.',
            color: 'bg-gray-50 border-gray-100 text-gray-600',
          },
        ].map((r) => (
          <div key={r.role} className={`rounded-xl border p-4 ${r.color}`}>
            <p className="font-semibold text-sm mb-1">{r.role}</p>
            <p className="text-xs opacity-80">{r.desc}</p>
          </div>
        ))}
      </div>

      <UtilisateursClient utilisateurs={utilisateurs} />
    </div>
  )
}
