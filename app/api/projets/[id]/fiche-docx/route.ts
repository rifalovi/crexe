// ─── API Route : Téléchargement fiche d'impact DOCX ─────────────────────────
// GET /api/projets/[id]/fiche-docx
// Génère dynamiquement la fiche d'impact Word du projet depuis les données Supabase.
// Format calqué sur P14_fiche_impact_editable.docx (référence OIF)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, BorderStyle,
  WidthType, ShadingType, PageNumber, PageBreak,
  ExternalHyperlink, LevelFormat,
} from 'docx'

// ─── Palette OIF ─────────────────────────────────────────────────────────────
const OIF_BLUE    = '003DA5'
const OIF_DARK    = '042C53'
const OIF_PURPLE  = '6B2C91'
const OIF_GREEN   = '0F6E56'
const OIF_GOLD    = 'D4A017'
const GRAY_LIGHT  = 'F0F4FA'  // fond colonne label (identique référence)
const GRAY_BORDER = 'B5B5B5'  // bordure tableau (identique référence)
const GRAY_TEXT   = '333333'
const GRAY_SUBTLE = '888888'
const GRAY_MID    = 'E2E8F0'
const WHITE       = 'FFFFFF'

const PS_COLORS: Record<string, string> = {
  PS1: OIF_BLUE,
  PS2: OIF_PURPLE,
  PS3: OIF_GREEN,
}

// ─── Bordures tableau style référence ────────────────────────────────────────
const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: GRAY_BORDER }
const tableBorders = {
  top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder,
}
const noBorder = { style: BorderStyle.NONE, size: 0, color: WHITE }

// ─── Helpers cellules ─────────────────────────────────────────────────────────
function makeCell(
  content: string | (TextRun | ExternalHyperlink)[],
  opts: {
    bold?: boolean
    color?: string
    bg?: string
    width?: number
    italic?: boolean
    size?: number
    align?: typeof AlignmentType[keyof typeof AlignmentType]
    rowSpan?: number
  } = {}
): TableCell {
  const textContent = typeof content === 'string'
    ? [new TextRun({
        text: content,
        bold: opts.bold ?? false,
        color: opts.color ?? GRAY_TEXT,
        italics: opts.italic ?? false,
        size: opts.size ?? 20,
        font: 'Arial',
      })]
    : content

  return new TableCell({
    borders: tableBorders,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.bg ? { fill: opts.bg, type: ShadingType.CLEAR } : undefined,
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    rowSpan: opts.rowSpan,
    children: [
      new Paragraph({
        children: textContent,
        alignment: opts.align ?? AlignmentType.LEFT,
      }),
    ],
  })
}

// Cellule label (colonne gauche bleue pâle)
function labelCell(text: string, width = 3120) {
  return makeCell(text, { bold: true, bg: GRAY_LIGHT, color: GRAY_TEXT, width, size: 20 })
}

// Cellule valeur (colonne droite)
function valueCell(
  text: string,
  opts: { bold?: boolean; color?: string; width?: number; size?: number } = {}
) {
  return makeCell(text, {
    bold: opts.bold ?? false,
    color: opts.color ?? GRAY_TEXT,
    width: opts.width ?? 6240,
    size: opts.size ?? 20,
  })
}

// ─── Titre de section (Heading 1 style référence) ────────────────────────────
function sectionHeading(text: string, accent = OIF_BLUE): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, color: accent, font: 'Arial' })],
    spacing: { before: 360, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: accent, space: 6 } },
  })
}

// Sous-titre de section
function subHeading(text: string, accent = OIF_BLUE): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, color: accent, font: 'Arial' })],
    spacing: { before: 240, after: 80 },
  })
}

// ─── Formate les valeurs budgétaires ─────────────────────────────────────────
function fmtEuro(v: number | null | undefined): string {
  if (v == null) return '—'
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2).replace('.', ',')} M\u20AC`
  if (v >= 1_000)     return `${Math.round(v / 1_000)} k\u20AC`
  return `${v.toLocaleString('fr-FR')} \u20AC`
}

function fmtPct(v: number | null | undefined): string {
  return v == null ? '—' : `${v} %`
}

// ─── Infographie KPI : grille de 4 chiffres-chocs ───────────────────────────
// On utilise un tableau 2×2 avec grands chiffres colorés (comme une slide)
function buildKpiGrid(
  kpis: { valeur: string; label: string; couleur: string }[]
): Table {
  // Créer les cellules KPI
  const kpiCell = (kpi: { valeur: string; label: string; couleur: string }, width: number) =>
    new TableCell({
      borders: {
        top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
      },
      width: { size: width, type: WidthType.DXA },
      shading: { fill: GRAY_LIGHT, type: ShadingType.CLEAR },
      margins: { top: 200, bottom: 200, left: 240, right: 240 },
      children: [
        new Paragraph({
          children: [new TextRun({
            text: kpi.valeur,
            bold: true,
            size: 52, // 26pt — chiffre-choc
            color: kpi.couleur,
            font: 'Arial',
          })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [new TextRun({
            text: kpi.label,
            bold: false,
            size: 18,
            color: GRAY_TEXT,
            font: 'Arial',
          })],
          alignment: AlignmentType.CENTER,
        }),
      ],
    })

  // Séparateur invisible entre cellules
  const sepCell = (width = 200) => new TableCell({
    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
    width: { size: width, type: WidthType.DXA },
    children: [new Paragraph({ children: [] })],
  })

  const cols = Math.min(kpis.length, 4)
  const colWidth = Math.floor((9360 - (cols - 1) * 200) / cols)

  // Construire les cellules de la ligne
  const cells: TableCell[] = []
  kpis.slice(0, cols).forEach((kpi, i) => {
    cells.push(kpiCell(kpi, colWidth))
    if (i < cols - 1) cells.push(sepCell())
  })

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
    columnWidths: kpis.slice(0, cols).flatMap((_, i) => i < cols - 1 ? [colWidth, 200] : [colWidth]),
    rows: [new TableRow({ children: cells })],
  })
}

// ─── Handler principal ────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Récupération parallèle
    const [projRes, indRes, temRes, partRes, evtRes, psRes] = await Promise.all([
      supabase.from('projets').select('*').eq('id', id).maybeSingle(),
      supabase.from('indicateurs').select('*').eq('projet_id', id).order('ordre'),
      supabase.from('temoignages').select('*').eq('projet_id', id).order('mise_en_avant', { ascending: false }),
      supabase.from('partenariats').select('*').eq('projet_id', id).order('ordre').limit(20),
      supabase.from('evenements').select('*').eq('projet_id', id).order('date_evenement').limit(20),
      supabase.from('programmes_strategiques').select('*'),
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projet = projRes.data as any
    if (!projet) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const indicateurs  = (indRes.data  ?? []) as any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const temoignages  = (temRes.data  ?? []) as any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partenariats = (partRes.data ?? []) as any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const evenements   = (evtRes.data  ?? []) as any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ps           = ((psRes.data  ?? []) as any[]).find((p) => p.id === projet.ps_id)
    const accent       = PS_COLORS[projet.ps_id as string] ?? OIF_BLUE
    const ci           = (projet.cercles_impact ?? {}) as Record<string, Record<string, string>>

    // ── KPI grille infographique (cercles d'impact ou indicateurs clés)
    const kpiSource: { valeur: string; label: string; couleur: string }[] = []
    if (ci.coeur?.valeur)   kpiSource.push({ valeur: ci.coeur.valeur,   label: 'Investissement OIF',          couleur: accent })
    if (ci.niveau1?.valeur) kpiSource.push({ valeur: ci.niveau1.valeur, label: ci.niveau1.label ?? 'Bénéficiaires directes', couleur: accent })
    if (ci.niveau2?.valeur) kpiSource.push({ valeur: ci.niveau2.valeur, label: ci.niveau2.label ?? 'Familles touchées',      couleur: OIF_GOLD })
    if (ci.niveau3?.valeur) kpiSource.push({ valeur: ci.niveau3.valeur, label: ci.niveau3.label ?? 'Communautés mobilisées', couleur: GRAY_TEXT })
    // Compléter avec indicateurs si insuffisant
    if (kpiSource.length < 2) {
      for (const ind of indicateurs.slice(0, 4 - kpiSource.length)) {
        const val = ind.valeur_pourcentage != null
          ? `${ind.valeur_pourcentage} %`
          : ind.valeur_numerique != null
            ? `${ind.valeur_numerique.toLocaleString('fr-FR')} ${ind.unite ?? ''}`.trim()
            : null
        if (val) kpiSource.push({ valeur: val, label: ind.libelle ?? '', couleur: accent })
      }
    }

    // ── Tableau Cercles d'impact
    const cercleHeaderRow = new TableRow({
      children: [
        makeCell('Cercle',        { bold: true, bg: OIF_DARK, color: WHITE, width: 1960, size: 19 }),
        makeCell('Périmètre',     { bold: true, bg: OIF_DARK, color: WHITE, width: 2400, size: 19 }),
        makeCell('Chiffre-clé',   { bold: true, bg: OIF_DARK, color: WHITE, width: 2600, size: 19 }),
        makeCell('Type de preuve',{ bold: true, bg: OIF_DARK, color: WHITE, width: 2400, size: 19 }),
      ],
    })
    const cercleRows: TableRow[] = [cercleHeaderRow]
    const ringsConfig = [
      { key: 'coeur',   label: 'Cœur',     defaultPerimetre: 'Investissement OIF',        defaultPreuve: 'Comptabilité OIF · vérifié' },
      { key: 'niveau1', label: 'Niveau 1',  defaultPerimetre: 'Bénéficiaires directes',    defaultPreuve: 'Mesuré · enquête satisfaction' },
      { key: 'niveau2', label: 'Niveau 2',  defaultPerimetre: 'Familles transformées',     defaultPreuve: 'Estimé · hypothèse démographique' },
      { key: 'niveau3', label: 'Niveau 3',  defaultPerimetre: 'Communautés mobilisées',    defaultPreuve: 'Observé · missions terrain' },
      { key: 'niveau4', label: 'Niveau 4',  defaultPerimetre: 'Espace francophone',         defaultPreuve: 'Institutionnel · CMF 2025' },
    ]
    for (const ring of ringsConfig) {
      const r = ci[ring.key]
      if (!r) continue
      const isCoeur = ring.key === 'coeur'
      cercleRows.push(new TableRow({
        children: [
          makeCell(ring.label, { bold: true, bg: isCoeur ? accent : GRAY_LIGHT, color: isCoeur ? WHITE : GRAY_TEXT, width: 1960, size: 19 }),
          makeCell(r.label ?? r.perimetre ?? ring.defaultPerimetre, { width: 2400, size: 19 }),
          makeCell(r.valeur ?? r.description ?? '—', { bold: true, color: accent, width: 2600, size: 19 }),
          makeCell(r.type_preuve ?? ring.defaultPreuve, { italic: true, color: GRAY_SUBTLE, width: 2400, size: 18 }),
        ],
      }))
    }

    // ── Tableau indicateurs
    const indicRows: TableRow[] = [
      new TableRow({
        children: [
          makeCell('Valeur',     { bold: true, bg: OIF_DARK, color: WHITE, width: 1800, size: 19 }),
          makeCell('Indicateur', { bold: true, bg: OIF_DARK, color: WHITE, width: 5400, size: 19 }),
          makeCell('Catégorie',  { bold: true, bg: OIF_DARK, color: WHITE, width: 2160, size: 19 }),
        ],
      }),
      ...indicateurs.map((ind, i) => {
        const valStr = ind.valeur_pourcentage != null
          ? fmtPct(ind.valeur_pourcentage)
          : ind.valeur_numerique != null
            ? `${ind.valeur_numerique.toLocaleString('fr-FR')} ${ind.unite ?? ''}`.trim()
            : '—'
        const rowBg = i % 2 === 0 ? WHITE : GRAY_LIGHT
        return new TableRow({
          children: [
            makeCell(valStr,                   { bold: true, color: accent, bg: rowBg, width: 1800, size: 20 }),
            makeCell(ind.libelle ?? '',         {                           bg: rowBg, width: 5400, size: 19 }),
            makeCell((ind.categorie ?? '').replace(/_/g, ' '), { italic: true, bg: rowBg, width: 2160, size: 18 }),
          ],
        })
      }),
    ]

    // ── Partenaires : tableau si plusieurs
    const partRows: TableRow[] = partenariats.map((p, i) => new TableRow({
      children: [
        makeCell(
          `${p.nom ?? ''}${p.acronyme ? ` (${p.acronyme})` : ''}`,
          { bold: true, bg: i % 2 === 0 ? WHITE : GRAY_LIGHT, color: accent, width: 3120, size: 19 }
        ),
        makeCell(p.description ?? (p.type ?? ''), { bg: i % 2 === 0 ? WHITE : GRAY_LIGHT, width: 6240, size: 19 }),
      ],
    }))

    // ─────────────────────────────────────────────────────────────────────────
    // CONSTRUCTION DU DOCUMENT
    // ─────────────────────────────────────────────────────────────────────────
    const doc = new Document({
      numbering: {
        config: [{
          reference: 'oif-bullets',
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 560, hanging: 280 } },
              run: { size: 20, color: accent, font: 'Arial' },
            },
          }],
        }],
      },
      styles: {
        default: {
          document: { run: { font: 'Arial', size: 20, color: GRAY_TEXT } },
        },
      },
      sections: [{
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 }, // ~2 cm
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'ORGANISATION INTERNATIONALE DE LA FRANCOPHONIE',
                    bold: true, size: 18, color: OIF_PURPLE, font: 'Arial',
                  }),
                ],
                spacing: { after: 0 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Fiche d'impact · Projet ${projet.code_officiel ?? id}`,
                    size: 20, color: GRAY_SUBTLE, font: 'Arial',
                  }),
                ],
                spacing: { after: 40 },
                border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GRAY_MID, space: 4 } },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'CREXE 2025 · Données validées et publiées    ', size: 16, color: GRAY_SUBTLE, font: 'Arial' }),
                  new TextRun({ text: 'Page ', size: 16, color: GRAY_SUBTLE, font: 'Arial' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GRAY_SUBTLE, font: 'Arial' }),
                  new TextRun({ text: ' / ', size: 16, color: GRAY_SUBTLE, font: 'Arial' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: GRAY_SUBTLE, font: 'Arial' }),
                ],
                alignment: AlignmentType.RIGHT,
                border: { top: { style: BorderStyle.SINGLE, size: 4, color: GRAY_MID, space: 4 } },
              }),
            ],
          }),
        },
        children: [

          // ── PAGE DE TITRE ─────────────────────────────────────────────────

          // Titre principal
          new Paragraph({
            children: [
              new TextRun({ text: projet.nom ?? '', bold: true, size: 44, color: accent, font: 'Arial' }),
            ],
            spacing: { before: 240, after: 40 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: accent, space: 6 } },
          }),
          // Accroche
          new Paragraph({
            children: [
              new TextRun({ text: projet.accroche ?? '', italics: true, size: 24, color: '555555', font: 'Arial' }),
            ],
            spacing: { before: 40, after: 120 },
          }),
          // Programme + exercice
          new Paragraph({
            children: [
              new TextRun({
                text: `${ps?.id ?? ''}${ps?.nom ? ` · ${ps.nom}` : ''} · Exercice ${projet.annee_exercice ?? '2025'}`,
                size: 18, color: accent, bold: true, font: 'Arial',
              }),
            ],
            spacing: { after: 320 },
          }),

          // ── INFOGRAPHIE : Grille KPI ──────────────────────────────────────
          ...(kpiSource.length >= 2 ? [
            new Paragraph({
              children: [new TextRun({ text: 'Chiffres-clés du projet', bold: true, size: 22, color: OIF_DARK, font: 'Arial' })],
              spacing: { after: 80 },
            }),
            buildKpiGrid(kpiSource.slice(0, 4)),
            new Paragraph({ children: [], spacing: { after: 320 } }),
          ] : []),

          // ── 1. FICHE SIGNALÉTIQUE ─────────────────────────────────────────
          sectionHeading('1 · Fiche signalétique', accent),
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            columnWidths: [3120, 6240],
            rows: [
              new TableRow({ children: [labelCell('Intitulé'), valueCell(projet.nom ?? '')] }),
              new TableRow({ children: [labelCell('Code officiel'), valueCell(projet.code_officiel ?? id)] }),
              new TableRow({ children: [labelCell('Programme stratégique'), valueCell(`${ps?.id ?? '—'} — ${ps?.nom ?? ''}`)] }),
              new TableRow({ children: [labelCell('Exercice'), valueCell(String(projet.annee_exercice ?? '2025'))] }),
              new TableRow({ children: [labelCell('Budget engagé'), valueCell(projet.budget_engage != null ? `${fmtEuro(projet.budget_engage)}${projet.budget_modifie ? ` (budget modifié : ${fmtEuro(projet.budget_modifie)})` : ''}` : '—')] }),
              ...(projet.engagement_global != null ? [new TableRow({ children: [labelCell('Engagement global'), valueCell(fmtEuro(projet.engagement_global))] })] : []),
              new TableRow({ children: [labelCell("Taux d'exécution"), valueCell(fmtPct(projet.taux_execution), { bold: true, color: accent })] }),
              ...(projet.nombre_pays != null ? [new TableRow({ children: [labelCell('Couverture géographique'), valueCell(`${projet.nombre_pays} pays`)] })] : []),
              ...(projet.nombre_projets_deposes != null ? [new TableRow({ children: [labelCell('Candidatures reçues'), valueCell(`${(projet.nombre_projets_deposes as number).toLocaleString('fr-FR')} projets finalisés déposés`)] })] : []),
              ...(projet.nombre_projets_retenus != null ? [new TableRow({ children: [labelCell('Projets retenus'), valueCell(`${projet.nombre_projets_retenus} nouveaux projets`, { bold: true, color: accent })] })] : []),
            ],
          }),

          // ── 2. CERCLES D'IMPACT ───────────────────────────────────────────
          new Paragraph({ children: [new PageBreak()] }),
          sectionHeading("2 · Les quatre cercles d'impact", accent),
          ...(projet.description ? [
            new Paragraph({
              children: [new TextRun({ text: projet.description, size: 20, color: '444444', font: 'Arial', italics: true })],
              spacing: { after: 160 },
            }),
          ] : []),
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            columnWidths: [1960, 2400, 2600, 2400],
            rows: cercleRows,
          }),

          // ── 3. INDICATEURS ────────────────────────────────────────────────
          new Paragraph({ children: [new PageBreak()] }),
          sectionHeading('3 · Indicateurs de transformation', accent),
          new Paragraph({
            children: [new TextRun({
              text: "Les indicateurs ci-dessous sont issus de l'enquête de satisfaction menée auprès des bénéficiaires du projet.",
              size: 19, color: '666666', font: 'Arial', italics: true,
            })],
            spacing: { after: 160 },
          }),
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            columnWidths: [1800, 5400, 2160],
            rows: indicRows,
          }),

          // ── 4. TÉMOIGNAGES ────────────────────────────────────────────────
          ...(temoignages.length > 0 ? [
            new Paragraph({ children: [new PageBreak()] }),
            sectionHeading('4 · Voix du terrain — témoignages sourcés', accent),
            new Paragraph({
              children: [new TextRun({
                text: "Les témoignages ci-dessous sont sourcés et vérifiables.",
                size: 19, color: '666666', font: 'Arial', italics: true,
              })],
              spacing: { after: 200 },
            }),
            ...temoignages.flatMap((t) => [
              new Paragraph({
                children: [
                  new TextRun({ text: '\u201C' + (t.citation ?? '') + '\u201D', size: 22, color: OIF_DARK, italics: true, font: 'Arial' }),
                ],
                spacing: { before: 160, after: 60 },
                indent: { left: 720 },
                border: { left: { style: BorderStyle.SINGLE, size: 12, color: accent, space: 4 } },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: '\u2014 ', size: 18, color: accent, font: 'Arial' }),
                  ...(t.auteur ? [new TextRun({ text: t.auteur, bold: true, size: 18, color: OIF_DARK, font: 'Arial' })] : []),
                  ...(t.fonction ? [new TextRun({ text: `, ${t.fonction}`, size: 18, color: GRAY_SUBTLE, font: 'Arial' })] : []),
                  ...(t.pays ? [new TextRun({ text: ` [${t.pays}]`, size: 16, color: accent, bold: true, font: 'Arial' })] : []),
                  ...(t.source_url ? [
                    new TextRun({ text: '   ', size: 18 }),
                    new ExternalHyperlink({
                      link: t.source_url,
                      children: [new TextRun({ text: t.source ?? 'Source', size: 17, color: OIF_BLUE, style: 'Hyperlink', font: 'Arial' })],
                    }),
                  ] : t.source ? [
                    new TextRun({ text: `   ${t.source}`, size: 17, color: GRAY_SUBTLE, font: 'Arial' }),
                  ] : []),
                ],
                indent: { left: 720 },
                spacing: { after: 200 },
              }),
            ]),
          ] : []),

          // ── 5. PARTENARIATS ───────────────────────────────────────────────
          ...(partenariats.length > 0 ? [
            sectionHeading('5 · Partenariats et ancrage institutionnel', accent),
            ...(partRows.length > 0 ? [
              new Table({
                width: { size: 9360, type: WidthType.DXA },
                columnWidths: [3120, 6240],
                rows: partRows,
              }),
              new Paragraph({ children: [], spacing: { after: 160 } }),
            ] : []),
          ] : []),

          // ── 6. ACTIVITÉS / ÉVÉNEMENTS ─────────────────────────────────────
          ...(evenements.length > 0 ? [
            sectionHeading('6 · Activités structurantes 2025', accent),
            ...evenements.map((e) => {
              const dateStr = e.date_evenement
                ? new Date(e.date_evenement).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
                : ''
              const children: TextRun[] = []
              if (dateStr) children.push(new TextRun({ text: `${dateStr} — `, bold: true, size: 20, color: accent, font: 'Arial' }))
              children.push(new TextRun({ text: e.titre ?? '', bold: true, size: 20, font: 'Arial', color: GRAY_TEXT }))
              if (e.description) children.push(new TextRun({ text: ` : ${e.description}`, size: 20, font: 'Arial', color: GRAY_TEXT }))
              if (e.lieu) children.push(new TextRun({ text: ` (${e.lieu})`, size: 19, italics: true, color: GRAY_SUBTLE, font: 'Arial' }))
              return new Paragraph({
                children,
                spacing: { before: 80, after: 80 },
                numbering: { reference: 'oif-bullets', level: 0 },
              })
            }),
          ] : []),

          // ── 7. NOTE MÉTHODOLOGIQUE ────────────────────────────────────────
          new Paragraph({ children: [new PageBreak()] }),
          sectionHeading("7 · Fiche méthodologique du visuel d'impact", accent),

          subHeading('7.1 · Choix du format : les cercles concentriques', accent),
          new Paragraph({
            children: [new TextRun({
              text: "La représentation en cercles concentriques traduit la mécanique de rayonnement propre à l'action OIF : chaque euro investi au cœur génère des effets qui s'amplifient à mesure qu'ils s'éloignent du centre — de la bénéficiaire directe à l'espace francophone entier.",
              size: 19, color: '555555', font: 'Arial',
            })],
            spacing: { after: 160 },
          }),

          subHeading('7.2 · Palette chromatique', accent),
          new Paragraph({
            children: [new TextRun({
              text: `Couleur principale du programme : #${accent}. Bleu OIF (#003DA5) pour les éléments institutionnels ; or (#D4A017) pour les chiffres-chocs.`,
              size: 19, color: '555555', font: 'Arial',
            })],
            spacing: { after: 160 },
          }),

          subHeading('7.3 · Hiérarchie de preuve', accent),
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            columnWidths: [2340, 7020],
            rows: [
              new TableRow({ children: [labelCell('Mesuré', 2340), valueCell('Données issues d\'enquête directe auprès des bénéficiaires', { width: 7020 })] }),
              new TableRow({ children: [labelCell('Estimé', 2340), valueCell('Projection méthodologique avec hypothèse documentée', { width: 7020 })] }),
              new TableRow({ children: [labelCell('Observé', 2340), valueCell('Constats issus de missions terrain et rapports de suivi', { width: 7020 })] }),
              new TableRow({ children: [labelCell('Institutionnel', 2340), valueCell('Effets documentés au niveau des politiques publiques', { width: 7020 })] }),
            ],
          }),
          new Paragraph({ children: [], spacing: { after: 200 } }),

          // ── 8. ZONE LIBRE ─────────────────────────────────────────────────
          sectionHeading('8 · Zone libre pour annotations', OIF_DARK),
          new Paragraph({
            children: [new TextRun({
              text: "Cet espace est laissé vierge pour permettre à l'équipe communication OIF d'ajouter des éléments spécifiques à chaque usage.",
              size: 19, color: '999999', italics: true, font: 'Arial',
            })],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [new TextRun({ text: ' ', size: 20 })],
            spacing: { after: 1440 },
            border: { bottom: { style: BorderStyle.DASHED, size: 4, color: GRAY_MID, space: 1 } },
          }),
          new Paragraph({
            children: [new TextRun({ text: ' ', size: 20 })],
            spacing: { after: 1440 },
            border: { bottom: { style: BorderStyle.DASHED, size: 4, color: GRAY_MID, space: 1 } },
          }),
          new Paragraph({
            children: [new TextRun({ text: ' ', size: 20 })],
            spacing: { after: 1440 },
            border: { bottom: { style: BorderStyle.DASHED, size: 4, color: GRAY_MID, space: 1 } },
          }),
        ],
      }],
    })

    const buffer = await Packer.toBuffer(doc)
    const filename = `CREXE_2025_${(projet.code_officiel ?? id).replace(/[^a-zA-Z0-9_-]/g, '_')}_fiche_impact.docx`

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.byteLength),
      },
    })
  } catch (err) {
    console.error('[fiche-docx] Erreur génération DOCX:', err)
    return NextResponse.json({ error: 'Erreur serveur lors de la génération du DOCX' }, { status: 500 })
  }
}
