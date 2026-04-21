-- ─── Diagnostic et correction du compte admin CREXE ─────────────────────────
-- Exécuter dans : Supabase Dashboard → SQL Editor
-- Objectif : corriger l'erreur "Cannot coerce the result to a single JSON object"
--            ou "Projet introuvable ou accès refusé" dans /admin/projets/[id]/edit
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Concept pédagogique — Pourquoi cela se produit-il ?
-- L'erreur apparaît quand is_admin() retourne false pour votre compte, car :
--   1. Votre ligne dans la table `profils` n'existe pas encore, OU
--   2. Votre rôle n'est pas 'admin', OU
--   3. actif = false dans votre profil
-- Résultat : la politique RLS "Admin voit tous projets" est false → 0 lignes
-- retournées → .maybeSingle() retourne null → erreur affichée.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── ÉTAPE 1 : Vérifier l'état de votre compte ───────────────────────────────

-- Voir tous les utilisateurs et leurs profils
SELECT
  u.id,
  u.email,
  u.created_at                    AS inscription,
  p.role,
  p.actif,
  p.nom_complet,
  CASE WHEN p.id IS NULL THEN '⚠️ Pas de profil' ELSE '✓ Profil OK' END AS statut_profil
FROM auth.users u
LEFT JOIN profils p ON p.id = u.id
ORDER BY u.created_at DESC;

-- ─── ÉTAPE 2 : Vérifier si is_admin() vous reconnaît ────────────────────────
-- (Remplacez l'email ci-dessous par le vôtre)

-- Tester directement la fonction pour un email donné :
SELECT
  u.email,
  p.role,
  p.actif,
  (p.role = 'admin' AND p.actif = true) AS is_admin_result
FROM auth.users u
LEFT JOIN profils p ON p.id = u.id
WHERE u.email = 'rifalovi@gmail.com';  -- ← remplacez par votre email admin

-- ─── ÉTAPE 3 : Promouvoir votre compte en admin ──────────────────────────────
-- Option A — Le profil existe déjà : mettre à jour le rôle et activer le compte

UPDATE profils
SET
  role  = 'admin',
  actif = true
WHERE email = 'rifalovi@gmail.com';  -- ← remplacez par votre email admin

-- Option B — Le profil n'existe pas encore (première connexion jamais faite) :
-- Décommenter les lignes suivantes si UPDATE n'a affecté aucune ligne (0 rows updated)

/*
INSERT INTO profils (id, email, nom_complet, role, actif)
SELECT
  id,
  email,
  coalesce(raw_user_meta_data->>'nom_complet', split_part(email, '@', 1)),
  'admin',
  true
FROM auth.users
WHERE email = 'rifalovi@gmail.com'  -- ← remplacez par votre email admin
ON CONFLICT (id) DO UPDATE SET
  role  = 'admin',
  actif = true;
*/

-- ─── ÉTAPE 4 : Vérifier que tous les projets sont accessibles ────────────────

SELECT
  id,
  code_officiel,
  nom,
  statut,
  annee_exercice
FROM projets
ORDER BY code_officiel;

-- ─── ÉTAPE 5 : Vérifier les contraintes unique nécessaires ───────────────────
-- Ces contraintes doivent exister pour que les upserts admin fonctionnent.

SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('chaine_resultats', 'era_resultats', 'projets')
  AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
ORDER BY tc.table_name, tc.constraint_type;

-- Résultat attendu :
-- chaine_resultats | chaine_resultats_projet_unique | UNIQUE | projet_id
-- era_resultats    | era_resultats_projet_edition_unique | UNIQUE | projet_id + edition_annee
-- projets          | projets_pkey | PRIMARY KEY | id

-- ─── ÉTAPE 6 : Appliquer les migrations manquantes si nécessaire ──────────────
-- Si chaine_resultats_projet_unique est absent, exécutez migration_chaine_resultats.sql
-- Si era_resultats_projet_edition_unique est absent, exécutez migration_era_resultats.sql
-- Si les tables chaine_resultats / era_resultats sont absentes → idem

-- ─────────────────────────────────────────────────────────────────────────────
-- ✅ Après exécution de l'ÉTAPE 3, rechargez la page /admin/projets/[id]/edit
-- ─────────────────────────────────────────────────────────────────────────────
