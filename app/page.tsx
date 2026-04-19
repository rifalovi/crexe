// Phase 0 — Page placeholder institutionnelle
// Sera remplacée à la Phase 2 par la landing complète

export default function HomePage() {
  return (
    <main className="min-h-screen bg-oif-cream flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl text-center space-y-8">

        {/* Badge OIF */}
        <div className="inline-flex items-center gap-2 bg-oif-blue text-white text-sm font-medium px-4 py-2 rounded-full">
          <span>Organisation internationale de la Francophonie</span>
        </div>

        {/* Titre principal */}
        <div className="space-y-4">
          <h1 className="font-editorial text-4xl md:text-6xl font-semibold text-oif-blue-dark leading-tight">
            Plateforme CREXE
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            La plateforme de valorisation des projets de la Francophonie —
            données, impact et récits du Compte-Rendu d&apos;Exécution 2025.
          </p>
        </div>

        {/* Statut */}
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-3 h-3 rounded-full bg-oif-gold animate-pulse" />
            <span className="text-sm font-medium text-oif-blue-dark">
              En construction
            </span>
          </div>
          <p className="text-sm text-muted-foreground text-left">
            Cette plateforme est en cours de développement. Elle permettra de
            visualiser l&apos;impact des projets OIF, d&apos;explorer les données CREXE
            et d&apos;interroger un assistant IA spécialisé.
          </p>
        </div>

        {/* Barre de progression des phases */}
        <div className="text-left max-w-md mx-auto space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Avancement du projet
          </p>
          {[
            { phase: "Phase 0", label: "Bootstrap", done: true },
            { phase: "Phase 1", label: "Base de données", done: false },
            { phase: "Phase 2", label: "Landing page", done: false },
            { phase: "Phase 3", label: "Fiches projets", done: false },
            { phase: "Phase 4", label: "Dashboard & cartes", done: false },
            { phase: "Phase 5", label: "Chatbot IA", done: false },
          ].map((item) => (
            <div key={item.phase} className="flex items-center gap-3 text-sm">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  item.done ? "bg-oif-blue" : "bg-border"
                }`}
              />
              <span className="text-muted-foreground w-16 flex-shrink-0 text-xs">
                {item.phase}
              </span>
              <span className={item.done ? "text-oif-blue-dark font-medium" : "text-muted-foreground"}>
                {item.label}
              </span>
              {item.done && (
                <span className="ml-auto text-xs text-oif-blue font-medium">✓</span>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground pt-4 border-t border-border">
          © {new Date().getFullYear()} Organisation internationale de la Francophonie —
          Données CREXE 2025
        </p>
      </div>
    </main>
  );
}
