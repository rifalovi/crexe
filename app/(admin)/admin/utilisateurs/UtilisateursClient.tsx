'use client'

// ─── Gestion interactive des utilisateurs ─────────────────────────────────────
// Création de comptes avec mot de passe provisoire, changement de rôle,
// activation / désactivation, réinitialisation du mot de passe.
//
// Concept : toutes les écritures passent par des Server Actions (actions.ts)
// qui utilisent le client admin (service_role) — jamais de clé exposée ici.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import {
  creerUtilisateur,
  modifierRoleUtilisateur,
  toggleActiverUtilisateur,
  reinitialiserMotDePasse,
} from '../actions'

interface Utilisateur {
  id: string
  email: string
  nom_complet: string | null
  role: string
  actif: boolean
  created_at: string
}

const ROLE_CONFIG: Record<string, { label: string; css: string; desc: string }> = {
  admin:   { label: 'Admin',    css: 'bg-red-100 text-red-700',   desc: 'Accès complet' },
  editeur: { label: 'Éditeur', css: 'bg-blue-100 text-blue-700', desc: 'Édition projets' },
  lecteur: { label: 'Lecteur', css: 'bg-gray-100 text-gray-600', desc: 'Lecture seule' },
}

function genererMotDePasse(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$'
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function UtilisateursClient({ utilisateurs: initial }: { utilisateurs: Utilisateur[] }) {
  const [utilisateurs, setUtilisateurs] = useState(initial)
  const [showNew, setShowNew]   = useState(false)
  const [busy, setBusy]         = useState<string | null>(null)
  const [flash, setFlash]       = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [resetId, setResetId]   = useState<string | null>(null)
  const [newMdp, setNewMdp]     = useState('')

  // Formulaire création
  const [form, setForm] = useState({
    email: '', nom_complet: '', role: 'editeur' as const,
    mot_de_passe: genererMotDePasse(),
  })
  const [motDePasseCopied, setMotDePasseCopied] = useState(false)

  const showFlash = (type: 'ok' | 'err', msg: string) => {
    setFlash({ type, msg })
    setTimeout(() => setFlash(null), 6000)
  }

  // ── Créer un utilisateur ─────────────────────────────────────────────────
  async function handleCreer() {
    if (!form.email || !form.nom_complet || !form.mot_de_passe) {
      showFlash('err', 'Tous les champs sont obligatoires.')
      return
    }
    setBusy('create')
    try {
      await creerUtilisateur(form)
      showFlash('ok', `Compte créé pour ${form.email}. Mot de passe provisoire : ${form.mot_de_passe}`)
      setUtilisateurs(prev => [{
        id: Date.now().toString(), email: form.email,
        nom_complet: form.nom_complet, role: form.role, actif: true,
        created_at: new Date().toISOString(),
      }, ...prev])
      setForm({ email: '', nom_complet: '', role: 'editeur', mot_de_passe: genererMotDePasse() })
      setShowNew(false)
    } catch (e) {
      showFlash('err', e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setBusy(null)
    }
  }

  // ── Changer le rôle ──────────────────────────────────────────────────────
  async function handleRole(userId: string, role: string) {
    setBusy(userId + '_role')
    try {
      await modifierRoleUtilisateur(userId, role as 'admin' | 'editeur' | 'lecteur')
      setUtilisateurs(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
    } catch (e) {
      showFlash('err', e instanceof Error ? e.message : 'Erreur')
    } finally { setBusy(null) }
  }

  // ── Activer / désactiver ─────────────────────────────────────────────────
  async function handleToggle(userId: string, actif: boolean) {
    setBusy(userId + '_actif')
    try {
      await toggleActiverUtilisateur(userId, actif)
      setUtilisateurs(prev => prev.map(u => u.id === userId ? { ...u, actif } : u))
    } catch (e) {
      showFlash('err', e instanceof Error ? e.message : 'Erreur')
    } finally { setBusy(null) }
  }

  // ── Réinitialiser mot de passe ───────────────────────────────────────────
  async function handleReset(userId: string) {
    if (!newMdp || newMdp.length < 8) {
      showFlash('err', 'Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setBusy(userId + '_reset')
    try {
      await reinitialiserMotDePasse(userId, newMdp)
      showFlash('ok', `Mot de passe réinitialisé. Communiquez le nouveau mot de passe à l'utilisateur.`)
      setResetId(null)
      setNewMdp('')
    } catch (e) {
      showFlash('err', e instanceof Error ? e.message : 'Erreur')
    } finally { setBusy(null) }
  }

  const copyMdp = async () => {
    await navigator.clipboard.writeText(form.mot_de_passe)
    setMotDePasseCopied(true)
    setTimeout(() => setMotDePasseCopied(false), 2000)
  }

  return (
    <div className="space-y-6">

      {/* Flash */}
      {flash && (
        <div className={`px-4 py-3 rounded-xl text-sm flex items-start gap-2 ${
          flash.type === 'ok' ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' : 'bg-red-50 border border-red-100 text-red-700'
        }`}>
          <span className="flex-shrink-0">{flash.type === 'ok' ? '✓' : '✗'}</span>
          <span>{flash.msg}</span>
        </div>
      )}

      {/* ── Bouton + formulaire de création ─────────────────────────────────── */}
      {!showNew ? (
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-[var(--oif-blue)] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[var(--oif-blue-dark)] transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Créer un compte utilisateur
        </button>
      ) : (
        <div className="bg-white rounded-2xl border border-[var(--oif-blue)]/20 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Nouveau compte utilisateur</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Nom complet <span className="text-red-400">*</span>
              </label>
              <input
                type="text" value={form.nom_complet}
                onChange={e => setForm(f => ({ ...f, nom_complet: e.target.value }))}
                placeholder="Prénom Nom"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Adresse email <span className="text-red-400">*</span>
              </label>
              <input
                type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="prenom.nom@francophonie.org"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Rôle</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as typeof form.role }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/20"
              >
                <option value="lecteur">Lecteur — accès lecture seule</option>
                <option value="editeur">Éditeur — peut modifier les projets</option>
                <option value="admin">Admin — accès complet</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Mot de passe provisoire <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text" value={form.mot_de_passe}
                  onChange={e => setForm(f => ({ ...f, mot_de_passe: e.target.value }))}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/20"
                />
                <button onClick={copyMdp}
                  className={`px-3 py-2 text-xs rounded-lg border transition ${motDePasseCopied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  {motDePasseCopied ? '✓ Copié' : 'Copier'}
                </button>
                <button onClick={() => setForm(f => ({ ...f, mot_de_passe: genererMotDePasse() }))}
                  className="px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
                  ↻
                </button>
              </div>
              <p className="text-xs text-amber-600 mt-1">⚠️ Communiquez ce mot de passe à l&apos;utilisateur — il pourra le modifier depuis &quot;Mon compte&quot;</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreer} disabled={busy === 'create'}
              className="bg-[var(--oif-blue)] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[var(--oif-blue-dark)] transition disabled:opacity-50">
              {busy === 'create' ? '⏳ Création…' : '✓ Créer le compte'}
            </button>
            <button onClick={() => setShowNew(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5 transition">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* ── Liste des utilisateurs ───────────────────────────────────────────── */}
      {utilisateurs.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">Aucun utilisateur enregistré.</p>
          <p className="text-xs text-gray-300 mt-1">Créez le premier compte ci-dessus.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span className="flex-1">Utilisateur</span>
            <span className="w-28">Rôle</span>
            <span className="w-20">Statut</span>
            <span className="w-32">Actions</span>
          </div>
          <div className="divide-y divide-gray-50">
            {utilisateurs.map(u => {
              const roleConf = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.lecteur
              const isResetting = resetId === u.id
              return (
                <div key={u.id} className={`px-6 py-4 ${!u.actif ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-4">
                    {/* Avatar + info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[var(--oif-blue)]/10 flex items-center justify-center text-sm font-bold text-[var(--oif-blue)] flex-shrink-0">
                        {(u.nom_complet ?? u.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{u.nom_complet || '—'}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                    </div>

                    {/* Rôle (modifiable) */}
                    <div className="w-28">
                      <select
                        value={u.role}
                        onChange={e => handleRole(u.id, e.target.value)}
                        disabled={busy === u.id + '_role'}
                        className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 focus:outline-none focus:ring-1 cursor-pointer ${roleConf.css} disabled:opacity-50`}
                      >
                        <option value="lecteur">Lecteur</option>
                        <option value="editeur">Éditeur</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {/* Actif / inactif */}
                    <div className="w-20">
                      <button
                        onClick={() => handleToggle(u.id, !u.actif)}
                        disabled={busy === u.id + '_actif'}
                        className={`text-xs font-medium px-2 py-1 rounded-full transition ${u.actif ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                      >
                        {u.actif ? '● Actif' : '○ Inactif'}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="w-32 flex items-center justify-end">
                      <button
                        onClick={() => { setResetId(isResetting ? null : u.id); setNewMdp(genererMotDePasse()) }}
                        className="text-xs text-gray-400 hover:text-[var(--oif-blue)] transition px-2 py-1 rounded"
                      >
                        ↺ MDP
                      </button>
                    </div>
                  </div>

                  {/* Panel réinitialisation MDP */}
                  {isResetting && (
                    <div className="mt-3 pl-12 flex items-center gap-2">
                      <input
                        type="text" value={newMdp}
                        onChange={e => setNewMdp(e.target.value)}
                        placeholder="Nouveau mot de passe"
                        className="flex-1 px-3 py-1.5 text-xs font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--oif-blue)]/20"
                      />
                      <button onClick={() => handleReset(u.id)} disabled={busy === u.id + '_reset'}
                        className="text-xs font-semibold text-white bg-[var(--oif-blue)] px-3 py-1.5 rounded-lg hover:bg-[var(--oif-blue-dark)] transition disabled:opacity-50">
                        {busy === u.id + '_reset' ? '⏳' : '✓ Appliquer'}
                      </button>
                      <button onClick={() => setResetId(null)} className="text-xs text-gray-400 hover:text-gray-600 px-2">✕</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
