// ─── Layout de l'espace admin — blindé contre tout crash ─────────────────────
// TOUTES les opérations asynchrones sont enveloppées dans try-catch.
// Aucune exception ne peut crasher le layout en production.
// ─────────────────────────────────────────────────────────────────────────────

import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let userEmail = ''
  let userRole  = 'lecteur'

  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch { /* Server Component lecture seule */ }
          },
        },
      }
    )

    // Auth — si ça échoue, on redirige vers /login
    const authRes = await supabase.auth.getUser()
    const user    = authRes.data?.user

    if (!user) redirect('/login')

    userEmail = user.email ?? ''

    // Profil — protégé : si ça échoue, on garde les valeurs par défaut
    try {
      const { data: profile } = await supabase
        .from('profils')
        .select('role, nom_complet, email')
        .eq('id', user.id)
        .maybeSingle()

      if (profile) {
        userRole  = profile.role  ?? 'lecteur'
        userEmail = profile.email ?? userEmail
      }
    } catch {
      // Profil illisible → on continue avec rôle par défaut (jamais de crash)
    }

  } catch (err) {
    // next/navigation redirect() lance une exception spéciale — on la laisse passer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((err as any)?.digest?.startsWith('NEXT_REDIRECT')) throw err
    // Toute autre exception → redirection sécurisée
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar userEmail={userEmail} userRole={userRole} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
