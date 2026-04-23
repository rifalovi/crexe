// ─── API Route : Lecture des demandes d'accès (admin only) ───────────────────
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  // Vérification auth admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const admin = createAdminClient()
  const { data: profil } = await admin.from('profils').select('role').eq('id', user.id).maybeSingle()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!profil || (profil as any).role !== 'admin') return NextResponse.json([], { status: 403 })

  const { data } = await admin
    .from('demandes_acces')
    .select('id, email, nom_complet, poste, message, statut, created_at, notes_admin')
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}
