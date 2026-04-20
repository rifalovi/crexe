'use client'

// ─── Partie interactive de la page utilisateurs ───────────────────────────────
// Ce composant client permet de modifier les rôles en temps réel.
// On sépare la partie serveur (chargement des données) de la partie client
// (interactivité) : c'est le pattern "Server Component + Client Component leaf".
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Utilisateur {
  id: string
  email: string
  nom_complet: string | null
  role: string
  actif: boolean
  created_at: string
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  editeur: 'bg-blue-100 text-blue-700',
  lecteur: 'bg-gray-100 text-gray-600',
}

export default function UtilisateursClient({
  utilisateurs: initial,
}: {
  utilisateurs: Utilisateur[]
}) {
  const [utilisateurs, setUtilisateurs] = useState(initial)
  const [updating, setUpdating] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function updateRole(userId: string, newRole: string) {
    setUpdating(userId)
    const { error } = await supabase
      .from('profils')
      .update({ role: newRole })
      .eq('id', userId)

    if (!error) {
      setUtilisateurs(prev =>
        prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
      )
    }
    setUpdating(null)
  }

  if (utilisateurs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
        <p className="text-gray-400 text-sm">Aucun utilisateur enregistré</p>
        <p className="text-xs text-gray-300 mt-1">
          Les utilisateurs apparaissent ici après leur première connexion
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Utilisateur
            </th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Rôle
            </th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Inscrit le
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {utilisateurs.map((u) => (
            <tr key={u.id} className="hover:bg-gray-50 transition">
              <td className="px-5 py-4">
                <p className="font-medium text-gray-800">{u.nom_complet ?? u.email}</p>
                {u.nom_complet && (
                  <p className="text-xs text-gray-400">{u.email}</p>
                )}
              </td>
              <td className="px-5 py-4">
                <select
                  value={u.role}
                  onChange={(e) => updateRole(u.id, e.target.value)}
                  disabled={updating === u.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border-0 cursor-pointer disabled:opacity-50 ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  <option value="lecteur">Lecteur</option>
                  <option value="editeur">Éditeur</option>
                  <option value="admin">Admin</option>
                </select>
                {updating === u.id && (
                  <span className="ml-2 text-xs text-gray-400">Mise à jour…</span>
                )}
              </td>
              <td className="px-5 py-4 text-gray-400 text-xs">
                {new Date(u.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
