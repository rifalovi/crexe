// ─── Layout admin — anti-crash maximum ───────────────────────────────────────
// Aucun redirect() à l'intérieur d'un try-catch (conflit NEXT_REDIRECT).
// On utilise un flag booléen pour décider de rediriger APRÈS le bloc try.
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
  let userEmail    = ''
  let userRole     = 'lecteur'
  let needsRedirect = false

  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll()  { return cookieStore.getAll() },
          setAll(cs) {
            try { cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) }
            catch { /* Server Component lecture seule */ }
          },
        },
      }
    )

    const { data: authData } = await supabase.auth.getUser()
    const user = authData?.user

    if (!user) {
      needsRedirect = true
    } else {
      userEmail = user.email ?? ''

      // Lecture du profil — toujours maybeSingle(), jamais single()
      const { data: profile } = await supabase
        .from('profils')
        .select('role, email')
        .eq('id', user.id)
        .maybeSingle()

      if (profile) {
        userRole  = (profile as { role?: string }).role  ?? 'lecteur'
        userEmail = (profile as { email?: string }).email ?? userEmail
      }
    }
  } catch {
    // Toute exception (réseau, cookie, Supabase down) → redirection sécurisée
    needsRedirect = true
  }

  // Redirect APRÈS le try-catch — évite le conflit avec NEXT_REDIRECT
  if (needsRedirect) redirect('/login')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar userEmail={userEmail} userRole={userRole} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
