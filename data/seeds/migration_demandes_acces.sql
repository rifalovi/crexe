-- ─── Migration : Table demandes_acces ────────────────────────────────────────
-- Gère les demandes d'activation de compte soumises via /demande-acces.
-- Seuls les emails @francophonie.org sont acceptés.
-- L'admin approuve ou rejette depuis /admin/demandes.
-- En cas d'approbation, Supabase envoie un email d'invitation.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS demandes_acces (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT        NOT NULL,
  nom_complet     TEXT        NOT NULL,
  organisation    TEXT        DEFAULT 'OIF',
  poste           TEXT,
  message         TEXT,       -- Message optionnel du demandeur
  statut          TEXT        NOT NULL DEFAULT 'en_attente'
                  CHECK (statut IN ('en_attente', 'approuve', 'rejete')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  traite_par      UUID        REFERENCES auth.users(id),
  traite_le       TIMESTAMPTZ,
  notes_admin     TEXT        -- Notes internes de l'admin (raison du rejet, etc.)
);

-- Index pour requêtes courantes
CREATE INDEX IF NOT EXISTS idx_demandes_statut  ON demandes_acces(statut);
CREATE INDEX IF NOT EXISTS idx_demandes_email   ON demandes_acces(email);
CREATE INDEX IF NOT EXISTS idx_demandes_created ON demandes_acces(created_at DESC);

-- Contrainte : un email ne peut soumettre qu'une seule demande en attente à la fois
CREATE UNIQUE INDEX IF NOT EXISTS idx_demandes_email_attente
  ON demandes_acces(email)
  WHERE statut = 'en_attente';

-- RLS
ALTER TABLE demandes_acces ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent tout voir et modifier
CREATE POLICY "demandes_admin_all" ON demandes_acces
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Insertion publique — n'importe qui peut soumettre une demande
-- (contrôle du domaine fait côté applicatif + trigger ci-dessous)
CREATE POLICY "demandes_insert_public" ON demandes_acces
  FOR INSERT WITH CHECK (
    email LIKE '%@francophonie.org'
    AND statut = 'en_attente'
  );

-- ─── Trigger : vérification domaine email ────────────────────────────────────
CREATE OR REPLACE FUNCTION verifier_domaine_demande()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email NOT LIKE '%@francophonie.org' THEN
    RAISE EXCEPTION 'Seules les adresses @francophonie.org sont autorisées. Votre adresse : %', NEW.email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_verifier_domaine ON demandes_acces;
CREATE TRIGGER trg_verifier_domaine
  BEFORE INSERT ON demandes_acces
  FOR EACH ROW EXECUTE FUNCTION verifier_domaine_demande();

COMMENT ON TABLE demandes_acces IS 'Demandes d''activation de compte CREXE — uniquement @francophonie.org';
