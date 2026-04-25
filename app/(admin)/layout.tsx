// ─── Layout de l'espace admin ─────────────────────────────────────────────────
// Ce fichier est un Server Component (pas de 'use client').
// Il récupère les informations de l'utilisateur connecté côté serveur,
// puis les passe à la sidebar (Client Component) via des props.
//
// Pourquoi Server Component ici ?
// - La lecture du cookie de session est une opération serveur
// - On évite d'exposer la clé service_role côté client
// - L'UI de navigation est statique, seule la logique auth est dynamique
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
  const cookieStore = await cookies()

  // Client Supabase côté serveur avec accès aux cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Le layout est un Server Component en lecture seule
            // Les cookies sont gérés par le middleware
          }
        },
      },
    }
  )

  // Double vérification côté serveur (le middleware l'a déjà fait,
  // mais on vérifie ici pour récupérer les données du profil)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Récupération du rôle depuis profils (table v3)
  // Note : user_profiles est l'ancienne table (v1), profils est la nouvelle (v3)
  // .maybeSingle() au lieu de .single() — évite l'exception si la ligne n'existe pas
  // (reproductible en production Netlify quand les cookies SSR ne transmettent pas
  //  correctement le token, causant 0 lignes retournées au lieu de 1)
  const { data: profile } = await supabase
    .from('profils')
    .select('role, nom_complet')
    .eq('id', user.id)
    .maybeSingle()

  const userRole = profile?.role ?? 'lecteur'

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar — reçoit les données via props, pas d'appel Supabase client-side */}
      <AdminSidebar
        userEmail={user.email ?? ''}
        userRole={userRole}
      />

      {/* Zone de contenu principale */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
