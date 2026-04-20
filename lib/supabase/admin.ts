// Client Supabase admin (service_role) — SERVEUR UNIQUEMENT
// ⚠️ Ne jamais exposer côté client — contourne toutes les politiques RLS
// Usage : import de données, seeds, opérations batch

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Variables Supabase manquantes — vérifiez .env.local')
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
