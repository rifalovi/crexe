'use client'

// ─── Mon compte — Profil et paramètres personnels ─────────────────────────────
// Route : /admin/mon-compte
//
// L'utilisateur peut :
//   - Voir ses informations (nom, email, rôle, statut)
//   - Modifier son mot de passe
//   - Se déconnecter
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

interface Profil {
  id: string
  email: string
  nom_complet: string | null
  role: string
  actif: boolean
  compte_verifie_oif: boolean
  organisation: string | null
  poste: string | null
  created_at: string
  date_derniere_connexion: string | null
}

const ROLE_CONFIG: Record<string, { label: string; css: string; desc: string }> = {
  admin:   { label: 'Administrateur', css: 'bg-red-100 text-red-700 border border-red-200',   desc: 'Accès complet à la plateforme' },
  editeur: { label: 'Éditeur',       css: 'bg-blue-100 text-blue-700 border border-blue-200', desc: 'Peut créer et modifier des projets' },
  lecteur: { label: 'Lecteur',       css: 'bg-gray-100 text-gray-600 border border-gray-200', desc: 'Accès en lecture seule' },
}

export default function MonComptePage() {
  const router = useRouter()
  const [profil, setProfil]       = useState<Profil | null>(null)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [flash, setFlash]         = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  // Formulaire modification profil
  const [nomComplet, setNomComplet]   = useState('')
  const [organisation, setOrganisation] = useState('')
  const [poste, setPoste]             = useState('')

  // Formulaire changement mot de passe
  const [mdpActuel, setMdpActuel]     = useState('')
  const [mdpNouv, setMdpNouv]         = useState('')
  const [mdpConf, setMdpConf]         = useState('')
  const [showMdp, setShowMdp]         = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const showFlash = (type: 'ok' | 'err', msg: string) => {
    setFlash({ type, msg })
    setTimeout(() => setFlash(null), 5000)
  }

  useEffect(() => {
    async function charger() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: p } = await supabase
        .from('profils')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (p) {
        setProfil(p as Profil)
        setNomComplet(p.nom_complet ?? '')
        setOrganisation(p.organisation ?? '')
        setPoste(p.poste ?? '')
      }
      setLoading(false)
    }
    charger()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sauvegarder le profil ────────────────────────────────────────────────
  async function sauvegarderProfil() {
    if (!profil) return
    setSaving(true)
    const { error } = await supabase
      .from('profils')
      .update({ nom_complet: nomComplet, organisation, poste, updated_at: new Date().toISOString() })
      .eq('id', profil.id)
    setSaving(false)
    if (error) showFlash('err', error.message)
    else {
      showFlash('ok', 'Profil mis à jour.')
      setProfil(prev => prev ? { ...prev, nom_complet: nomComplet, organisation, poste } : prev)
    }
  }

  // ── Changer le mot de passe ──────────────────────────────────────────────
  async function changerMotDePasse() {
    if (!mdpNouv || mdpNouv.length < 8) {
      showFlash('err', 'Le nouveau mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (mdpNouv !== mdpConf) {
      showFlash('err', 'Les deux mots de passe ne correspondent pas.')
      return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: mdpNouv })
    setSaving(false)
    if (error) showFlash('err', error.message)
    else {
      showFlash('ok', 'Mot de passe modifié avec succès.')
      setMdpActuel(''); setMdpNouv(''); setMdpConf('')
      setShowMdp(false)
    }
  }

  // ── Déconnexion ──────────────────────────────────────────────────────────
  async function seDeconnecter() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-400">
        <svg className="animate-spin mr-2 w-5 h-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Chargement…
      </div>
    )
  }

  const roleConf = ROLE_CONFIG[profil?.role ?? 'lecteur'] ?? ROLE_CONFIG.lecteur

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

      {/* ── En-tête ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mon compte</h1>
        <button
          onClick={seDeconnecter}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 px-4 py-2 rounded-xl transition"
        >
          <span>⎋</span> Se déconnecter
        </button>
      </div>

      {/* Flash */}
      {flash && (
        <div className={`px-4 py-3 rounded-xl text-sm ${
          flash.type === 'ok' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-700'
        }`}>
          {flash.type === 'ok' ? '✓' : '✗'} {flash.msg}
        </div>
      )}

      {/* ── Carte identité ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[var(--oif-blue)]/10 flex items-center justify-center text-2xl font-bold text-[var(--oif-blue)] flex-shrink-0">
            {(profil?.nom_complet ?? profil?.email ?? '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{profil?.nom_complet || 'Sans nom'}</p>
            <p className="text-sm text-gray-500">{profil?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleConf.css}`}>
                {roleConf.label}
              </span>
              {profil?.actif ? (
                <span className="text-xs text-emerald-600 font-medium">● Compte actif</span>
              ) : (
                <span className="text-xs text-gray-400">○ Compte inactif</span>
              )}
              {profil?.compte_verifie_oif && (
                <span className="text-xs text-[var(--oif-blue)] font-medium">✓ Vérifié OIF</span>
              )}
            </div>
          </div>
        </div>

        {/* Informations du compte */}
        <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-50 pt-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Rôle</p>
            <p className="text-gray-700 font-medium">{roleConf.label}</p>
            <p className="text-xs text-gray-400">{roleConf.desc}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Membre depuis</p>
            <p className="text-gray-700">
              {profil?.created_at ? new Date(profil.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Modifier le profil ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Informations personnelles</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Nom complet</label>
            <input
              type="text" value={nomComplet} onChange={e => setNomComplet(e.target.value)}
              placeholder="Prénom Nom"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Organisation</label>
              <input
                type="text" value={organisation} onChange={e => setOrganisation(e.target.value)}
                placeholder="OIF, UNESCO…"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Poste / Fonction</label>
              <input
                type="text" value={poste} onChange={e => setPoste(e.target.value)}
                placeholder="Chef de projet, Analyste…"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/20"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Adresse email</label>
            <input
              type="email" value={profil?.email ?? ''} disabled
              className="w-full px-3 py-2 text-sm border border-gray-100 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">L&apos;email ne peut être modifié que par un administrateur.</p>
          </div>
          <button
            onClick={sauvegarderProfil} disabled={saving}
            className="mt-2 px-5 py-2.5 text-sm font-semibold text-white bg-[var(--oif-blue)] hover:bg-[var(--oif-blue-dark)] rounded-xl transition disabled:opacity-50"
          >
            {saving ? '⏳ Enregistrement…' : '✓ Enregistrer les modifications'}
          </button>
        </div>
      </div>

      {/* ── Mot de passe ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Mot de passe</h2>
          <button
            onClick={() => setShowMdp(!showMdp)}
            className="text-xs text-[var(--oif-blue)] hover:underline font-medium"
          >
            {showMdp ? '▲ Fermer' : '▼ Modifier mon mot de passe'}
          </button>
        </div>

        {!showMdp ? (
          <p className="text-sm text-gray-400">••••••••••••</p>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Nouveau mot de passe</label>
              <input
                type="password" value={mdpNouv} onChange={e => setMdpNouv(e.target.value)}
                placeholder="Minimum 8 caractères"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Confirmer le nouveau mot de passe</label>
              <input
                type="password" value={mdpConf} onChange={e => setMdpConf(e.target.value)}
                placeholder="Répétez le mot de passe"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${
                  mdpConf && mdpNouv !== mdpConf ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[var(--oif-blue)]/20'
                }`}
              />
              {mdpConf && mdpNouv !== mdpConf && (
                <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
              )}
            </div>
            <button
              onClick={changerMotDePasse} disabled={saving || !mdpNouv || !mdpConf}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[var(--oif-blue)] hover:bg-[var(--oif-blue-dark)] rounded-xl transition disabled:opacity-50"
            >
              {saving ? '⏳ Modification…' : '✓ Changer le mot de passe'}
            </button>
          </div>
        )}
      </div>

      {/* ── Déconnexion ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Déconnexion</h2>
        <p className="text-xs text-gray-500 mb-4">Vous serez redirigé vers la page de connexion.</p>
        <button
          onClick={seDeconnecter}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition"
        >
          <span>⎋</span> Se déconnecter
        </button>
      </div>

    </div>
  )
}
