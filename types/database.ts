// Types TypeScript générés manuellement depuis schema.sql
// À régénérer via : npx supabase gen types typescript --project-id=avzwnypeppcrqcfyhvqv > types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TypePreuve = 'mesure' | 'estimation' | 'observation' | 'institutionnel'
export type TypeMedia = 'video' | 'article' | 'rapport' | 'interview' | 'autre'
export type TypePartenariat = 'technique' | 'financier' | 'institutionnel' | 'operationnel' | 'autre'
export type TypeEvenement = 'conference' | 'mission' | 'lancement' | 'publication' | 'partenariat' | 'autre'
export type TypeMediaFichier = 'photo' | 'video' | 'infographie' | 'document'

export interface Database {
  public: {
    Tables: {
      programmes_strategiques: {
        Row: {
          id: string
          // Colonnes v3
          code: string | null
          nom_court: string | null
          couleur_theme: string | null
          // Colonnes v1
          nom: string
          description: string | null
          ordre: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['programmes_strategiques']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['programmes_strategiques']['Insert']>
      }
      projets: {
        Row: {
          id: string
          // Colonnes v3 ajoutées par migration_v3_delta.sql
          code_officiel: string | null
          est_sous_projet: boolean
          projet_parent_id: string | null
          statut: 'brouillon' | 'en_revue' | 'publie' | 'archive'
          date_publication: string | null
          cree_par: string | null
          modifie_par: string | null
          // Colonnes v1 originales
          ps_id: string | null
          nom: string
          accroche: string | null
          description: string | null
          annee_exercice: number
          budget_modifie: number | null
          budget_engage: number | null
          engagement_global: number | null
          taux_execution: number | null
          nombre_pays: number | null
          nombre_projets_deposes: number | null
          nombre_projets_retenus: number | null
          thematiques: string[] | null
          mots_cles: string[] | null
          date_debut: string | null
          date_fin: string | null
          cercles_impact: Json | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['projets']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['projets']['Insert']>
      }
      indicateurs: {
        Row: {
          id: string
          projet_id: string | null
          libelle: string
          valeur_numerique: number | null
          valeur_pourcentage: number | null
          valeur_texte: string | null
          unite: string | null
          categorie: string | null
          type_preuve: TypePreuve | null
          source: string | null
          source_url: string | null
          date_mesure: string | null
          hypothese_calcul: string | null
          mise_en_avant: boolean
          ordre: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['indicateurs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['indicateurs']['Insert']>
      }
      temoignages: {
        Row: {
          id: string
          projet_id: string | null
          citation: string
          auteur: string | null
          fonction: string | null
          pays: string | null
          source: string | null
          source_url: string | null
          type_media: TypeMedia | null
          mise_en_avant: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['temoignages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['temoignages']['Insert']>
      }
      pays: {
        Row: {
          code_iso3: string
          nom_fr: string
          nom_en: string | null
          region: string | null
          latitude: number | null
          longitude: number | null
          est_francophone: boolean
        }
        Insert: Database['public']['Tables']['pays']['Row']
        Update: Partial<Database['public']['Tables']['pays']['Row']>
      }
      pays_couverture: {
        Row: {
          id: string
          projet_id: string | null
          pays_code: string | null
          role: string | null
          annee: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['pays_couverture']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['pays_couverture']['Insert']>
      }
      partenariats: {
        Row: {
          id: string
          projet_id: string | null
          nom: string
          acronyme: string | null
          type: TypePartenariat | null
          description: string | null
          logo_url: string | null
          site_url: string | null
          ordre: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['partenariats']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['partenariats']['Insert']>
      }
      evenements: {
        Row: {
          id: string
          projet_id: string | null
          titre: string
          description: string | null
          date_evenement: string | null
          lieu: string | null
          type: TypeEvenement | null
          lien_url: string | null
          ordre: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['evenements']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['evenements']['Insert']>
      }
      medias: {
        Row: {
          id: string
          projet_id: string | null
          url: string
          type: TypeMediaFichier | null
          legende: string | null
          credit: string | null
          est_couverture: boolean
          ordre: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['medias']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['medias']['Insert']>
      }
      documents_rag: {
        Row: {
          id: string
          projet_id: string | null
          contenu: string
          type_contenu: string | null
          section: string | null
          source_document: string | null
          source_page: number | null
          tokens_count: number | null
          embedding: number[] | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['documents_rag']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['documents_rag']['Insert']>
      }
    }
    Views: {
      // Vue v1 (conservée pour compatibilité)
      v_stats_globales: {
        Row: {
          nombre_projets: number | null
          nombre_pays: number | null
          budget_total_engage: number | null
          total_beneficiaires_economiques: number | null
        }
      }
      // Vues v3 (créées par migration_v3_delta.sql)
      v_stats_publiques: {
        Row: {
          projets_publies: number | null
          pays_couverts: number | null
          budget_total_engage: number | null
          programmes_actifs: number | null
          total_projets: number | null
        }
      }
      v_projets_publics: {
        Row: {
          id: string
          code_officiel: string | null
          ps_id: string | null
          projet_parent_id: string | null
          est_sous_projet: boolean | null
          nom: string
          accroche: string | null
          description: string | null
          annee_exercice: number | null
          budget_engage: number | null
          engagement_global: number | null
          taux_execution: number | null
          nombre_pays: number | null
          nombre_projets_retenus: number | null
          thematiques: string[] | null
          mots_cles: string[] | null
          cercles_impact: Json | null
          date_publication: string | null
          ps_nom: string | null
          ps_nom_court: string | null
          ps_couleur: string | null
          nb_temoignages_vedette: number | null
          nb_indicateurs_vedette: number | null
        }
      }
    }
    Functions: {
      match_documents: {
        Args: {
          query_embedding: number[]
          match_threshold?: number
          match_count?: number
          filter_projet_id?: string | null
        }
        Returns: {
          id: string
          projet_id: string
          contenu: string
          type_contenu: string | null
          section: string | null
          source_document: string | null
          source_page: number | null
          similarity: number
        }[]
      }
    }
  }
}
