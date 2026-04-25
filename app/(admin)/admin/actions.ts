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

  // Client admin pour lire le profil sans contrainte RLS (fiable en production)
  // .maybeSingle() au lieu de .single() — évite l'exception si la ligne n'existe pas
  const adminClient = createAdminClient()
  const { data: profil } = await adminClient
    .from('profils')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

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
// UTILISATEURS — Création et gestion via Supabase Auth Admin
// ═══════════════════════════════════════════════════════════════════════════════

// Concept : supabase.auth.admin.createUser() permet de créer un compte auth
// sans envoyer d'email de confirmation. On définit un mot de passe provisoire
// que l'admin communique à l'utilisateur. À la première connexion, l'utilisateur
// devra changer son mot de passe depuis "Mon compte".

export async function creerUtilisateur(payload: {
  email:       string
  mot_de_passe: string
  nom_complet: string
  role:        'admin' | 'editeur' | 'lecteur'
}) {
  await verifierAdmin()
  const admin = createAdminClient()

  // 1. Créer le compte auth (sans confirmation email — l'admin gère l'accès)
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email:          payload.email,
    password:       payload.mot_de_passe,
    email_confirm:  true,   // marquer l'email comme vérifié directement
    user_metadata:  { nom_complet: payload.nom_complet },
  })

  if (authErr) throw new Error(`Création compte impossible : ${authErr.message}`)

  const userId = authData.user.id

  // 2. Créer / mettre à jour le profil avec le rôle choisi
  const { error: profErr } = await admin.from('profils').upsert({
    id:                  userId,
    email:               payload.email,
    nom_complet:         payload.nom_complet,
    role:                payload.role,
    actif:               true,
    compte_verifie_oif:  false,
  }, { onConflict: 'id' })

  if (profErr) throw new Error(`Profil impossible : ${profErr.message}`)

  revalidatePath('/admin/utilisateurs')
  return { ok: true, userId }
}

export async function modifierRoleUtilisateur(userId: string, role: 'admin' | 'editeur' | 'lecteur') {
  await verifierAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('profils').update({ role }).eq('id', userId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/utilisateurs')
  return { ok: true }
}

export async function toggleActiverUtilisateur(userId: string, actif: boolean) {
  await verifierAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('profils').update({ actif }).eq('id', userId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/utilisateurs')
  return { ok: true }
}

export async function reinitialiserMotDePasse(userId: string, nouveauMdp: string) {
  await verifierAdmin()
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, { password: nouveauMdp })
  if (error) throw new Error(error.message)
  return { ok: true }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMANDES D'ACCÈS — Validation des comptes @francophonie.org
// ═══════════════════════════════════════════════════════════════════════════════

// Concept : approuverDemande utilise supabase.auth.admin.generateLink() pour créer
// un lien d'invitation. L'utilisateur clique ce lien → définit son mot de passe.
// C'est plus sécurisé que de créer un mot de passe temporaire côté serveur.

export async function approuverDemande(demandeId: string) {
  const adminUser = await verifierAdmin()
  const admin = createAdminClient()

  // Lire la demande
  const { data: demande, error: fetchErr } = await admin
    .from('demandes_acces')
    .select('email, nom_complet, poste')
    .eq('id', demandeId)
    .eq('statut', 'en_attente')
    .maybeSingle()

  if (fetchErr || !demande) throw new Error('Demande introuvable ou déjà traitée')

  // Créer le compte Supabase Auth + envoyer l'invitation
  const { data: inviteData, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
    demande.email,
    {
      data: { nom_complet: demande.nom_complet },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/login`,
    }
  )

  if (inviteErr) throw new Error(`Invitation impossible : ${inviteErr.message}`)

  const userId = inviteData.user?.id

  // Créer/mettre à jour le profil
  if (userId) {
    await admin.from('profils').upsert({
      id:          userId,
      email:       demande.email,
      nom_complet: demande.nom_complet,
      poste:       demande.poste,
      organisation: 'OIF',
      role:        'lecteur',
      actif:       true,
    }, { onConflict: 'id' })
  }

  // Marquer la demande comme approuvée
  const { error: updErr } = await admin
    .from('demandes_acces')
    .update({
      statut:     'approuve',
      traite_par: adminUser.id,
      traite_le:  new Date().toISOString(),
    })
    .eq('id', demandeId)

  if (updErr) throw new Error(`Mise à jour impossible : ${updErr.message}`)

  revalidatePath('/admin/demandes')
  return { ok: true }
}

export async function rejeterDemande(demandeId: string, notes?: string) {
  const adminUser = await verifierAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('demandes_acces')
    .update({
      statut:     'rejete',
      traite_par: adminUser.id,
      traite_le:  new Date().toISOString(),
      notes_admin: notes || null,
    })
    .eq('id', demandeId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/demandes')
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
