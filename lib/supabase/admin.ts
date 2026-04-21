// Client Supabase admin (service_role) — SERVEUR UNIQUEMENT
// ⚠️ Ne jamais exposer côté client — contourne toutes les politiques RLS
// Usage : import de données, seeds, opérations admin CRUD
//
// Note : on n'utilise pas le generic <Database> ici car certaines tables
// (crex_editions, resultats_era) ne sont pas encore dans le type généré.
// Le typage sera renforcé après un `supabase gen types typescript`.

import { createClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDatabase = any

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Variables Supabase manquantes — vérifiez .env.local')
  }

  return createClient<AnyDatabase>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
