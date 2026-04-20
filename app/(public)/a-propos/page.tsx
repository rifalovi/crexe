// ─── Page Méthodologie — À propos du CREXE ────────────────────────────────────
// Sources : Méthodologie ERA.docx · Séminaire exec 16 déc. 2025 (PDF)
//           Programmation quadriennale 2024-2027 de l'OIF
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import { CREX_ANNEE } from '@/components/shared/NavOIF'

export const metadata = {
  title: `Méthodologie — CREXE ${CREX_ANNEE}`,
  description: `Découvrez la démarche méthodologique du Compte-Rendu d'Exécution ${CREX_ANNEE} de l'OIF : cadre stratégique, théorie du changement, enquête ERA et gestion axée sur les résultats.`,
}

// ─── Données statiques ────────────────────────────────────────────────────────

const PROGRAMMES = [
  {
    code: 'PS1',
    label: 'Cultures et éducation',
    color: '#003DA5',
    bg: '#EEF3FF',
    description:
      "Renforcer l'usage et l'enseignement du français, améliorer la qualité éducative et soutenir l'écosystème culturel francophone à l'heure de la transformation numérique.",
    resultats_immediats: [
      "Adoption de plans d'action en faveur d'un enseignement en français de qualité",
      "Renforcement des compétences des enseignants et encadreurs pédagogiques",
      "Disponibilité accrue d'outils pédagogiques et contenus numériques adaptés",
      "Diversification de l'offre culturelle et éducative des CLAC",
    ],
    resultats_moyenterme: [
      "Amélioration de la qualité des enseignements bilingues dans l'éducation de base",
      "Renforcement de l'environnement francophone dans les écoles",
      "Accès élargi des élèves à des contenus culturels en français",
    ],
    impact:
      "Amélioration des résultats scolaires et ancrage durable du français comme vecteur de savoir, de culture et de citoyenneté.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    code: 'PS2',
    label: 'Démocratie et gouvernance',
    color: '#6B2C91',
    bg: '#F5EEFA',
    description:
      "Consolider la gouvernance démocratique, l'État de droit, les droits humains et l'égalité femmes-hommes pour faire de la Francophonie un espace de paix et de stabilité.",
    resultats_immediats: [
      "Amélioration des connaissances en matière d'état civil chez les acteurs locaux",
      "Accès élargi à une information fiable via des médias mieux régulés",
      "Engagement accru des institutions parlementaires sur les droits humains",
      "Modernisation des systèmes d'état civil et des processus électoraux",
    ],
    resultats_moyenterme: [
      "Renforcement de l'efficacité des institutions démocratiques",
      "Amélioration des capacités nationales en matière de sécurité et de justice",
      "Meilleure représentativité des jeunes et des femmes dans les processus électoraux",
    ],
    impact:
      "Consolidation durable de la gouvernance démocratique et de l'État de droit dans l'espace francophone.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    code: 'PS3',
    label: 'Développement durable',
    color: '#0F6E56',
    bg: '#EEF9F6',
    description:
      "Améliorer les conditions de vie des jeunes et des femmes par la formation professionnelle, le développement économique durable, l'innovation numérique et la coopération économique francophone.",
    resultats_immediats: [
      "Renforcement des capacités professionnelles dans les secteurs porteurs (numérique, tourisme, entrepreneuriat)",
      "Soutien aux initiatives climato-économiques et coopératives locales",
      "Appui aux institutions pour intégrer la gouvernance numérique dans leurs politiques",
    ],
    resultats_moyenterme: [
      "Amélioration de l'insertion professionnelle des jeunes et des femmes",
      "Croissance des entreprises francophones et diversification des partenariats",
      "Meilleure préparation des États aux négociations économiques internationales",
    ],
    impact:
      "Faire de la Francophonie un espace de solutions concrètes, de coopération stratégique et d'innovation inclusive.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.249 2.249 0 0017.5 15.28m-6.5 4.72v-1.5" />
      </svg>
    ),
  },
]

const PHASES = [
  {
    numero: '01',
    titre: 'Phase préparatoire',
    color: '#003DA5',
    etapes: [
      { label: 'Réunions avec les équipes projets', desc: "Présentation de la démarche, identification des bénéficiaires et désignation de référents nationaux dans les pays de mise en œuvre." },
      { label: 'Revue documentaire', desc: "Triangulation de 3 sources : SISE (Système Informatisé de Suivi-Évaluation), CREX 2024 et documents de projets/conventions." },
      { label: 'Sélection des indicateurs', desc: "Extraction des indicateurs standards de la programmation 2024-2027 par programme stratégique (PS1, PS2, PS3), privilégiant les effets qualitatifs." },
      { label: 'Échantillonnage (formule de Schwartz)', desc: "Taille d'échantillon calculée avec n = z²·p(1-p)/d², niveau de confiance à 95 % et marge d'erreur de 5 %." },
    ],
  },
  {
    numero: '02',
    titre: 'Collecte des données',
    color: '#6B2C91',
    etapes: [
      { label: 'Conception des questionnaires', desc: "Élaborés conjointement par le SCS et les équipes projets, orientés par les types de suivi et les effets de changement visés." },
      { label: 'Digitalisation via Survey Solutions', desc: "Questionnaires digitalisés sur la plateforme Survey Solutions pour faciliter la diffusion, limiter les erreurs de saisie et centraliser les réponses." },
      { label: 'Diffusion et collecte à distance', desc: "Questionnaires transmis par les équipes terrain aux bénéficiaires. Délai de réponse de 7 à 10 jours. Solution hybride papier pour les zones à faible connectivité." },
      { label: 'Centralisation au SCS', desc: "Réception directe et automatisée des réponses, garantissant fiabilité, confidentialité et traçabilité des données." },
    ],
  },
  {
    numero: '03',
    titre: 'Traitement et analyse',
    color: '#B83A2D',
    etapes: [
      { label: 'Analyse thématique de contenu', desc: "Les données qualitatives sont analysées par approche thématique pour identifier les perceptions de changement et les enseignements." },
      { label: 'Statistiques descriptives (SPSS + Excel)', desc: "Les données quantitatives sont traitées par statistiques descriptives, tests non paramétriques et modélisation économétrique." },
      { label: 'Triangulation des sources', desc: "Croisement des données d'enquête avec les résultats du SISE et les rapports terrain pour renforcer la fiabilité des conclusions." },
    ],
  },
  {
    numero: '04',
    titre: 'Rapportage et validation',
    color: '#0F6E56',
    etapes: [
      { label: 'Élaboration du CREXE', desc: "Intégration des résultats qualitatifs de l'enquête dans le rapport d'exécution annuel, enrichissant les indicateurs de réalisation quantitatifs." },
      { label: 'Processus de validation', desc: "Validation du rapport définitif avec les équipes projets, les référents pays et la direction du SCS pour garantir la rigueur institutionnelle." },
    ],
  },
]

const AMBITIONS = [
  { num: 1, label: "Renforcer l'influence des francophones dans le monde" },
  { num: 2, label: "Renforcer l'usage et l'enseignement de la langue française" },
  { num: 3, label: "Promouvoir la diversité culturelle et linguistique" },
  { num: 4, label: "Contribuer à faire de la Francophonie un espace de paix et de stabilité" },
  { num: 5, label: "Faire de la Francophonie un laboratoire de coopération stratégique et innovant" },
]

// ─── Composant principal ──────────────────────────────────────────────────────
export default function AProposPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Navigation fournie par le layout (public)/layout.tsx — ne pas dupliquer */}

      {/* ─── Hero ────────────────────────────────────────────────────── */}
      <section className="bg-[var(--oif-blue-dark)] text-white" style={{
        backgroundImage: 'radial-gradient(ellipse at 80% 20%, rgba(0,61,165,0.3) 0%, transparent 60%)',
      }}>
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-14">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--oif-gold)]" />
            Organisation internationale de la Francophonie · SCS
          </div>
          <h1 className="font-editorial text-4xl md:text-5xl font-semibold leading-tight max-w-3xl mb-5">
            Méthodologie{' '}
            <span className="text-[var(--oif-gold)]">& sources</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
            Le CREXE {CREX_ANNEE} repose sur une démarche de gestion axée sur les résultats (GAR),
            consolidée par une enquête qualitative auprès des bénéficiaires —
            la Mesure des Résultats et Apprentissages (ERA).
          </p>
          {/* Fil d'Ariane */}
          <div className="flex items-center gap-2 mt-8 text-xs text-white/40">
            <Link href="/" className="hover:text-white/70 transition">Accueil</Link>
            <span>›</span>
            <span className="text-white/70">Méthodologie</span>
          </div>
        </div>
      </section>

      {/* ─── Sommaire ancres ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-6 overflow-x-auto py-3 text-sm text-gray-500 whitespace-nowrap">
            <a href="#cadre" className="hover:text-[var(--oif-blue)] transition flex-shrink-0">Cadre stratégique</a>
            <span className="text-gray-200">·</span>
            <a href="#programmes" className="hover:text-[var(--oif-blue)] transition flex-shrink-0">3 programmes</a>
            <span className="text-gray-200">·</span>
            <a href="#enquete" className="hover:text-[var(--oif-blue)] transition flex-shrink-0">Enquête ERA</a>
            <span className="text-gray-200">·</span>
            <a href="#methodo" className="hover:text-[var(--oif-blue)] transition flex-shrink-0">Méthodologie</a>
            <span className="text-gray-200">·</span>
            <a href="#sources" className="hover:text-[var(--oif-blue)] transition flex-shrink-0">Sources</a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 space-y-20">

        {/* ─── Section 1 : Cadre stratégique ───────────────────────── */}
        <section id="cadre">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--oif-blue)] bg-[var(--oif-blue)]/8 px-3 py-1 rounded-full">
              01 · Cadre de référence
            </span>
          </div>
          <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[var(--oif-blue-dark)] mb-5">
            Le cadre stratégique de la Francophonie 2023-2030
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Adopté à Djerba (Tunisie) en novembre 2022, le Cadre stratégique de la
                Francophonie 2023-2030 constitue le document de référence commun à l'ensemble
                des institutions de la Francophonie. Il traduit une vision commune, des ambitions
                et des objectifs partagés pour la période.
              </p>
              <p className="text-gray-600 leading-relaxed">
                La programmation quadriennale 2024-2027, adoptée à la 44e Conférence ministérielle
                de la Francophonie à Yaoundé, en est la déclinaison opérationnelle : elle
                structure l'action de l'OIF autour de <strong className="text-[var(--oif-blue-dark)]">3 programmes stratégiques</strong> et{' '}
                <strong className="text-[var(--oif-blue-dark)]">20 projets d'action</strong>, avec la langue française
                comme socle commun, ancrés dans les Objectifs de développement durable (ODD).
              </p>
            </div>
            <div className="bg-[var(--oif-blue-dark)] rounded-2xl p-6 text-white">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Ambition 2030</p>
              <p className="font-editorial text-lg leading-snug mb-5">
                "Faire vivre, en français, l'aspiration à un monde plus solidaire, plus pacifique
                et plus respectueux de la diversité culturelle et linguistique."
              </p>
              <p className="text-white/50 text-xs">Contribution de l'OIF · Cadre stratégique 2023-2030</p>
            </div>
          </div>

          {/* 5 ambitions */}
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">5 ambitions structurantes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {AMBITIONS.map((a) => (
                <div key={a.num} className="bg-[var(--oif-neutral)] rounded-xl p-4 border border-gray-100">
                  <span className="text-2xl font-editorial font-bold text-[var(--oif-blue)]/20 block mb-2">
                    0{a.num}
                  </span>
                  <p className="text-sm text-gray-700 leading-snug">{a.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ODD */}
          <div className="mt-8 bg-[var(--oif-green)]/5 border border-[var(--oif-green)]/20 rounded-2xl px-6 py-5 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--oif-green)]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2">
                <path strokeLinecap="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.249 2.249 0 0017.5 15.28m-6.5 4.72v-1.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--oif-green)]">Ancrage ODD</p>
              <p className="text-sm text-gray-600 mt-0.5">
                L'OIF contribue directement à la réalisation de <strong>10 ODD sur 17</strong>.
                Chaque projet est aligné sur 1 ou plusieurs ODD et cibles spécifiques.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Section 2 : 3 Programmes stratégiques ───────────────── */}
        <section id="programmes">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--oif-purple)] bg-[var(--oif-purple)]/8 px-3 py-1 rounded-full">
              02 · Théories du changement
            </span>
          </div>
          <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[var(--oif-blue-dark)] mb-3">
            Les 3 programmes stratégiques
          </h2>
          <p className="text-gray-500 max-w-2xl mb-10">
            Chaque programme repose sur une théorie du changement articulant les résultats
            immédiats, à moyen terme et l'impact à long terme visé.
          </p>

          <div className="space-y-6">
            {PROGRAMMES.map((ps) => (
              <div key={ps.code} className="rounded-2xl border overflow-hidden" style={{ borderColor: ps.color + '30' }}>
                {/* En-tête */}
                <div className="px-6 py-5 flex items-start gap-4" style={{ backgroundColor: ps.bg }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: ps.color + '20', color: ps.color }}>
                    {ps.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: ps.color }}>
                        {ps.code}
                      </span>
                      <h3 className="font-semibold text-base" style={{ color: ps.color }}>{ps.label}</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{ps.description}</p>
                  </div>
                </div>

                {/* Corps : chaîne de résultats */}
                <div className="bg-white px-6 py-5 grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                      Résultats immédiats
                    </p>
                    <ul className="space-y-2">
                      {ps.resultats_immediats.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 leading-snug">
                          <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ps.color + '80' }} />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                      Effets à moyen terme
                    </p>
                    <ul className="space-y-2">
                      {ps.resultats_moyenterme.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 leading-snug">
                          <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ps.color }} />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl p-4" style={{ backgroundColor: ps.bg }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: ps.color }}>
                      Impact à long terme
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed italic">{ps.impact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Section 3 : L'enquête ERA ───────────────────────────── */}
        <section id="enquete">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B83A2D] bg-[#B83A2D]/8 px-3 py-1 rounded-full">
              03 · L'enquête ERA
            </span>
          </div>
          <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[var(--oif-blue-dark)] mb-5">
            Mesure des Résultats et Apprentissages (ERA)
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Dans le cadre de son dispositif de Gestion Axée sur les Résultats (GAR),
                le Service de la Conception et du Suivi des Projets (SCS) de l'OIF a consolidé
                ses pratiques en intégrant une approche systémique de mesure des effets induits
                par ses interventions.
              </p>
              <p className="text-gray-600 leading-relaxed">
                En complément du CREXE classique — basé sur des indicateurs de réalisation
                quantitatifs — le SCS conduit des enquêtes qualitatives ciblées auprès des
                bénéficiaires pour objectiver les résultats intermédiaires et les changements
                obtenus, conformément aux standards CAD-OCDE en matière de suivi axé sur les effets.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { titre: 'Documenter les effets', desc: "Recueillir données quantitatives et qualitatives sur les effets des actions de l'OIF sur les bénéficiaires." },
                { titre: 'Renseigner les indicateurs', desc: "Alimenter tous les indicateurs d'effets du cadre logique en identifiant les déterminants des changements." },
                { titre: 'Mesurer la satisfaction', desc: "Évaluer le niveau de satisfaction des bénéficiaires par service/appui et recueillir leurs propositions d'amélioration." },
                { titre: 'Renforcer la redevabilité', desc: "Trianguler les sources d'information pour enrichir l'analyse des contributions de l'OIF aux transformations observées." },
              ].map((obj, i) => (
                <div key={i} className="flex items-start gap-3 bg-[var(--oif-neutral)] rounded-xl px-4 py-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#B83A2D]/15 text-[#B83A2D] text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{obj.titre}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{obj.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Section 4 : Méthodologie en 4 phases ────────────────── */}
        <section id="methodo">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--oif-green)] bg-[var(--oif-green)]/8 px-3 py-1 rounded-full">
              04 · Démarche méthodologique
            </span>
          </div>
          <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[var(--oif-blue-dark)] mb-3">
            Un processus en 4 phases
          </h2>
          <p className="text-gray-500 max-w-2xl mb-10">
            L'enquête est conduite suivant une démarche rigoureuse articulée en 4 phases
            successives, de la préparation au rapportage final.
          </p>

          <div className="space-y-4">
            {PHASES.map((phase) => (
              <div key={phase.numero} className="rounded-2xl border overflow-hidden border-gray-100">
                <div className="px-6 py-4 flex items-center gap-4" style={{ backgroundColor: phase.color + '08' }}>
                  <span className="font-editorial text-3xl font-bold flex-shrink-0" style={{ color: phase.color + '30' }}>
                    {phase.numero}
                  </span>
                  <h3 className="font-semibold text-base" style={{ color: phase.color }}>{phase.titre}</h3>
                </div>
                <div className="bg-white px-6 py-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {phase.etapes.map((e, i) => (
                    <div key={i} className="border border-gray-50 rounded-xl p-4 bg-[var(--oif-neutral)]/50">
                      <p className="text-sm font-semibold text-gray-800 mb-1.5">{e.label}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{e.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Défis et leçons apprises */}
          <div className="mt-10 bg-amber-50 border border-amber-100 rounded-2xl px-6 py-6">
            <div className="flex items-center gap-3 mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C07A10" strokeWidth="2">
                <path strokeLinecap="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-sm font-semibold text-amber-800">Défis et leçons apprises</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { defi: "Compréhension de la démarche", lecon: "Messages d'accompagnement soignés explicitant le contexte, les objectifs et la confidentialité des réponses." },
                { defi: "Connectivité et accès numérique", lecon: "Solution hybride papier → saisie numérique par les structures locales pour les zones à faible connectivité." },
                { defi: "Diversité linguistique", lecon: "Traduction des questionnaires en langues nationales et entretiens oraux pour les bénéficiaires en situation d'illettrisme." },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-amber-100">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1.5">{item.defi}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.lecon}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Section 5 : Sources et qualité des données ──────────── */}
        <section id="sources">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              05 · Sources & qualité
            </span>
          </div>
          <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[var(--oif-blue-dark)] mb-3">
            Sources et niveaux de preuve
          </h2>
          <p className="text-gray-500 max-w-2xl mb-8">
            Chaque donnée affichée sur la plateforme est qualifiée selon son niveau de preuve,
            conformément aux standards méthodologiques CAD-OCDE.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { type: 'Mesuré', color: '#003DA5', desc: "Donnée issue d'une mesure directe, d'un comptage ou d'un système d'information officiel (SISE, registres)." },
              { type: 'Estimé', color: '#6B2C91', desc: "Donnée obtenue par extrapolation statistique ou modélisation à partir d'un échantillon représentatif." },
              { type: 'Observé', color: '#B83A2D', desc: "Donnée déclarative collectée auprès des bénéficiaires via l'enquête ERA qualitative." },
              { type: 'Institutionnel', color: '#0F6E56', desc: "Donnée issue de rapports officiels, de résolutions ou de documents adoptés par des instances institutionnelles." },
            ].map((niv) => (
              <div key={niv.type} className="rounded-xl border p-5" style={{ borderColor: niv.color + '30' }}>
                <span className="inline-block text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white mb-3"
                  style={{ backgroundColor: niv.color }}>
                  {niv.type}
                </span>
                <p className="text-sm text-gray-600 leading-relaxed">{niv.desc}</p>
              </div>
            ))}
          </div>

          {/* Sources documentaires */}
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            <div className="bg-[var(--oif-neutral)] px-6 py-4 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Documents de référence</p>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { titre: 'Cadre stratégique de la Francophonie 2023-2030', type: 'Cadre de référence', annee: '2022', source: 'OIF · Adopté à Djerba, Tunisie' },
                { titre: "Programmation quadriennale 2024-2027 de l'OIF", type: 'Document programmatique', annee: '2023', source: 'OIF · Adopté à la CMF de Yaoundé' },
                { titre: "Compte-Rendu d'Exécution (CREX) 2024", type: "Rapport d'exécution", annee: '2024', source: 'Service Conception et Suivi des Projets (SCS) · OIF' },
                { titre: "Méthodologie de l'enquête ERA — Rapport technique", type: 'Document méthodologique', annee: '2025', source: 'SCS · OIF · Survey Solutions' },
                { titre: 'Cadre logique et indicateurs standards de la programmation', type: 'Cadre de mesure', annee: '2024', source: 'SISE — Système Informatisé de Suivi des projets' },
              ].map((doc, i) => (
                <div key={i} className="px-6 py-4 flex items-start gap-4 hover:bg-[var(--oif-neutral)]/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[var(--oif-blue)]/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--oif-blue)" strokeWidth="1.8">
                      <path strokeLinecap="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 leading-snug">{doc.titre}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{doc.source}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                      {doc.type}
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--oif-blue)] bg-[var(--oif-blue)]/8 px-2 py-0.5 rounded-full">
                      {doc.annee}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <footer className="bg-[var(--oif-blue-dark)] text-white mt-20">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--oif-gold)] flex items-center justify-center">
              <span className="text-white font-black text-xs">OIF</span>
            </div>
            <div>
              <p className="text-sm font-semibold">CREXE {CREX_ANNEE}</p>
              <p className="text-xs text-white/40">Organisation internationale de la Francophonie</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <Link href="/" className="hover:text-white/70 transition">Accueil</Link>
            <Link href="/projets" className="hover:text-white/70 transition">Projets</Link>
            <Link href="/a-propos" className="hover:text-white/70 transition text-white/60">Méthodologie</Link>
          </div>
          <p className="text-xs text-white/30">
            Données · Licence ouverte OIF {CREX_ANNEE}
          </p>
        </div>
      </footer>
    </div>
  )
}
