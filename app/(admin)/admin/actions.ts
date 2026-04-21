'use server'
// ─── Server Actions admin — opérations d'écriture sécurisées ─────────────────
//
// Concept pédagogique — Pourquoi des Server Actions ici ?
// Les Server Actions s'exécutent UNIQUEMENT côté serveur (Node.js), jamais dans
// le navigateur. Cela permet d'utiliser la SUPABASE_SERVICE_ROLE_KEY qui :
//  - Contourne toutes les politiques RLS (Row Level Security)
//  - N'est jamais exposée au navigateur (contrairement à NEXT_PUBLIC_*)
//  - Permet à un admin de faire n'importe quelle opération sans restriction
//
// Pattern : le Client Component appelle une Server Action → la Server Action
// vérifie l'authentification côté serveur → exécute l'opération avec service_role
// ─────────────────────────────────────────────────────────────────────────────

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Helper : vérifier que l'appelant est bien un admin ──────────────────────
async function verifierAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Non authentifié')
  }

  // On utilise le client admin pour lire le profil (évite les contraintes de type)
  const adminClient = createAdminClient()
  const { data: profil } = await adminClient
    .from('profils')
    .select('role')
    .eq('id', user.id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!profil || (profil as any).role !== 'admin') {
    throw new Error('Accès refusé — rôle admin requis')
  }

  return user
}

// ═══════════════════════════════════════════════════════════════════════════════
// ÉDITIONS CREXE
// ═══════════════════════════════════════════════════════════════════════════════

export async function activerEdition(annee: number) {
  await verifierAdmin()
  const admin = createAdminClient()

  // Désactiver toutes les autres éditions
  await admin.from('crex_editions').update({ est_actif: false }).neq('annee', annee)

  // Activer celle-ci
  const { error } = await admin
    .from('crex_editions')
    .update({ est_actif: true })
    .eq('annee', annee)

  if (error) throw new Error(`Activation impossible : ${error.message}`)

  revalidatePath('/admin/editions')
  revalidatePath('/')
  return { ok: true }
}

export async function changerStatutEdition(annee: number, statut: string) {
  await verifierAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('crex_editions')
    .update({ statut })
    .eq('annee', annee)

  if (error) throw new Error(`Mise à jour impossible : ${error.message}`)

  revalidatePath('/admin/editions')
  return { ok: true }
}

export async function creerEdition(payload: {
  annee: number
  libelle: string
  description: string
}) {
  await verifierAdmin()
  const admin = createAdminClient()

  const { error } = await admin.from('crex_editions').insert({
    annee:       payload.annee,
    libelle:     payload.libelle,
    description: payload.description,
    statut:      'en_cours',
    est_actif:   false,
    date_debut:  `${payload.annee}-01-01`,
    date_fin:    `${payload.annee}-12-31`,
  })

  if (error) throw new Error(`Création impossible : ${error.message}`)

  revalidatePath('/admin/editions')
  return { ok: true }
}

// ═══════════════════════════════════════════════════════════════════════════════
// RÉSULTATS ERA
// ═══════════════════════════════════════════════════════════════════════════════

export async function mettreAJourResultatEra(
  id: string,
  updates: {
    projet_nom:    string
    projet_code:   string | null
    titre_section: string
    niveau:        string
    contenu:       string
    chiffre_cle:   string | null
    ordre:         number
  }
) {
  await verifierAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('resultats_era')
    .update(updates)
    .eq('id', id)

  if (error) throw new Error(`Mise à jour impossible : ${error.message}`)

  revalidatePath('/admin/era')
  revalidatePath('/resultats-era')
  return { ok: true }
}

export async function supprimerResultatEra(id: string) {
  await verifierAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('resultats_era')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Suppression impossible : ${error.message}`)

  revalidatePath('/admin/era')
  revalidatePath('/resultats-era')
  return { ok: true }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROJETS
// ═══════════════════════════════════════════════════════════════════════════════

export async function changerStatutProjet(
  id: string,
  statut: 'brouillon' | 'en_revue' | 'publie' | 'archive'
) {
  await verifierAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('projets')
    .update({ statut })
    .eq('id', id)

  if (error) throw new Error(`Mise à jour impossible : ${error.message}`)

  revalidatePath('/admin/projets')
  revalidatePath('/projets')
  return { ok: true }
}
