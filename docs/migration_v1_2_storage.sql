-- =====================================================================
-- MIGRATION v1.2 — Politiques Supabase Storage pour medias-crexe
-- À exécuter APRÈS avoir créé le bucket "medias-crexe" dans le dashboard
-- =====================================================================

-- Lecture publique des fichiers (tout le monde peut voir les images)
create policy "Lecture publique medias"
  on storage.objects for select
  using ( bucket_id = 'medias-crexe' );

-- Upload réservé au service_role (via API serveur uniquement)
create policy "Upload service_role uniquement"
  on storage.objects for insert
  with check (
    bucket_id = 'medias-crexe'
    and auth.role() = 'service_role'
  );

-- Suppression réservée au service_role
create policy "Suppression service_role uniquement"
  on storage.objects for delete
  using (
    bucket_id = 'medias-crexe'
    and auth.role() = 'service_role'
  );

-- Structure recommandée des dossiers dans le bucket :
-- medias-crexe/
--   projets/P14/couverture.jpg
--   projets/P14/galerie/photo1.jpg
--   projets/P14/galerie/photo2.jpg
--   temoignages/P14/fatou-traore.jpg
--   partenariats/logos/did.png
--   partenariats/logos/onu-femmes.png

select 'Storage configuré ✅' as statut;
