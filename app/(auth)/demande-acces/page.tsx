'use client'

// ─── Page de demande d'activation de compte ───────────────────────────────────
// Route : /demande-acces (publique — pas d'auth requise)
//
// Flux :
//   1. L'utilisateur remplit le formulaire avec son email @francophonie.org
//   2. La demande est enregistrée dans la table `demandes_acces` (statut: en_attente)
//   3. L'admin reçoit une notification (via /admin/demandes)
//   4. L'admin approuve → Supabase envoie un lien d'invitation à l'email
//   5. L'utilisateur clique le lien → crée son mot de passe → accède à la plateforme
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'

const DOMAINE_AUTORISE = '@francophonie.org'

export default function DemandeAccesPage() {
  const [form, setForm] = useState({
    email:       '',
    nom_complet: '',
    poste:       '',
    message:     '',
  })
  const [etape, setEtape] = useState<'formulaire' | 'succes' | 'erreur'>('formulaire')
  const [erreur, setErreur] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const emailValide = form.email.endsWith(DOMAINE_AUTORISE)

  async function soumettre(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')

    // Validation frontend
    if (!form.email || !form.nom_complet) {
      setErreur('Le nom et l\'adresse email sont obligatoires.')
      return
    }
    if (!emailValide) {
      setErreur(`Seules les adresses ${DOMAINE_AUTORISE} sont autorisées.`)
      return
    }

    setLoading(true)
    const { error } = await supabase.from('demandes_acces').insert({
      email:       form.email.toLowerCase().trim(),
      nom_complet: form.nom_complet.trim(),
      organisation: 'OIF',
      poste:       form.poste.trim() || null,
      message:     form.message.trim() || null,
      statut:      'en_attente',
    })
    setLoading(false)

    if (error) {
      if (error.message.includes('unique') || error.code === '23505') {
        setErreur('Une demande est déjà en cours pour cette adresse email. L\'équipe admin vous contactera prochainement.')
      } else if (error.message.includes('francophonie.org')) {
        setErreur(`Seules les adresses ${DOMAINE_AUTORISE} sont autorisées.`)
      } else {
        setErreur(`Erreur lors de l'envoi : ${error.message}`)
      }
      setEtape('erreur')
    } else {
      setEtape('succes')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--oif-neutral)] flex flex-col">

      {/* ── Header minimal ─────────────────────────────────────────────────── */}
      <div className="bg-[var(--oif-navy)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/assets/branding/oif/logo-oif-quadri-texte-blanc.png"
            alt="Logo OIF"
            width={88} height={42}
            style={{ height: 'auto' }}
            priority
          />
          <span className="text-white/70 text-sm hidden md:block">
            Plateforme CREXE
          </span>
        </div>
        <Link href="/login" className="text-white/60 hover:text-white text-sm transition">
          Déjà un compte ? Se connecter →
        </Link>
      </div>

      {/* ── Contenu principal ───────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          {etape === 'succes' ? (
            /* ── Confirmation d'envoi ────────────────────────────────────── */
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Demande envoyée !</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Votre demande d&apos;activation pour <strong>{form.email}</strong> a bien été reçue.
                L&apos;équipe administrative de l&apos;OIF va examiner votre demande et vous enverrez
                un lien de confirmation par email sous 24 à 48 heures ouvrées.
              </p>
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700 text-left mb-6">
                <strong>Important :</strong> Vérifiez votre boîte de réception, y compris les spams.
                Le message viendra de noreply@francophonie.org.
              </div>
              <Link href="/login"
                className="inline-flex items-center gap-2 text-sm text-[var(--oif-blue)] hover:underline font-medium">
                ← Retour à la page de connexion
              </Link>
            </div>

          ) : (
            /* ── Formulaire ───────────────────────────────────────────────── */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              {/* En-tête */}
              <div className="px-8 pt-8 pb-6 border-b border-gray-50">
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  Demande d&apos;accès à la plateforme CREXE
                </h1>
                <p className="text-sm text-gray-500">
                  Réservé aux collaborateurs OIF · Adresse <strong>@francophonie.org</strong> requise
                </p>
              </div>

              <form onSubmit={soumettre} className="px-8 py-6 space-y-4">

                {/* Erreur */}
                {erreur && (
                  <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                    ✗ {erreur}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Adresse email OIF <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="prenom.nom@francophonie.org"
                      required
                      className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${
                        form.email && !emailValide
                          ? 'border-red-300 focus:ring-red-200'
                          : form.email && emailValide
                            ? 'border-emerald-300 focus:ring-emerald-200'
                            : 'border-gray-200 focus:ring-[var(--oif-blue)]/20'
                      }`}
                    />
                    {form.email && (
                      <span className={`absolute right-3 top-2.5 text-xs font-medium ${emailValide ? 'text-emerald-600' : 'text-red-500'}`}>
                        {emailValide ? '✓ Domaine valide' : `⚠ Doit se terminer par ${DOMAINE_AUTORISE}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Nom complet */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Nom complet <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nom_complet}
                    onChange={e => setForm(f => ({ ...f, nom_complet: e.target.value }))}
                    placeholder="Prénom Nom"
                    required
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/20 transition"
                  />
                </div>

                {/* Poste */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Poste / Fonction
                  </label>
                  <input
                    type="text"
                    value={form.poste}
                    onChange={e => setForm(f => ({ ...f, poste: e.target.value }))}
                    placeholder="ex : Chargé(e) de programme, Analyste SCS…"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/20 transition"
                  />
                </div>

                {/* Message optionnel */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Message (optionnel)
                  </label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={3}
                    placeholder="Précisez l'objet de votre demande ou le nom de votre responsable…"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/20 transition resize-none"
                  />
                </div>

                {/* Notice */}
                <div className="bg-[var(--oif-neutral)] rounded-xl px-4 py-3 text-xs text-gray-500 leading-relaxed">
                  Votre demande sera examinée par l&apos;équipe d&apos;administration de la plateforme.
                  Une fois validée, vous recevrez un email de confirmation avec un lien pour activer
                  votre compte et définir votre mot de passe.
                </div>

                {/* Bouton */}
                <button
                  type="submit"
                  disabled={loading || !emailValide || !form.nom_complet}
                  className="w-full py-3 text-sm font-semibold text-white bg-[var(--oif-blue)] hover:bg-[var(--oif-navy)] rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Envoi en cours…
                    </>
                  ) : (
                    'Soumettre ma demande d\'accès'
                  )}
                </button>

                <p className="text-center text-xs text-gray-400">
                  Déjà un compte ?{' '}
                  <Link href="/login" className="text-[var(--oif-blue)] hover:underline font-medium">
                    Se connecter
                  </Link>
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
