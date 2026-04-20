// ─── API Route : Téléchargement fiche d'impact DOCX ─────────────────────────
// GET /api/projets/[id]/fiche.docx
// Génère dynamiquement la fiche d'impact Word du projet depuis les données Supabase.
// Structure calquée sur le modèle OIF P14_fiche_impact_editable.docx
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle,
  WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak,
  ExternalHyperlink,
} from 'docx'

// ─── Helpers visuels ─────────────────────────────────────────────────────────
const OIF_BLUE   = '003DA5'
const OIF_DARK   = '042C53'
const OIF_GOLD   = 'D4A017'
const OIF_GREEN  = '0F6E56'
const OIF_PURPLE = '6B2C91'
const GRAY_LIGHT = 'F0F4FA'
const GRAY_MID   = 'E2E8F0'
const WHITE      = 'FFFFFF'

const PS_COLORS: Record<string, string> = {
  PS1: OIF_BLUE,
  PS2: OIF_PURPLE,
  PS3: OIF_GREEN,
}

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder }
const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
}

function cell(
  text: string,
  opts: { bold?: boolean; color?: string; bg?: string; width?: number; italic?: boolean; size?: number } = {}
) {
  return new TableCell({
    borders,
    width: { size: opts.width ?? 4680, type: WidthType.DXA },
    shading: opts.bg ? { fill: opts.bg, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 160, right: 160 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: opts.bold ?? false,
            color: opts.color ?? OIF_DARK,
            italics: opts.italic ?? false,
            size: opts.size ?? 20,
            font: 'Arial',
          }),
        ],
      }),
    ],
  })
}

function sectionTitle(text: string, accent = OIF_BLUE) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, color: accent, font: 'Arial' })],
    spacing: { before: 360, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: accent, space: 1 } },
  })
}

function formatBudget(v: number | null): string {
  if (!v) return '—'
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2).replace('.', ',')} M€`
  if (v >= 1_000) return `${Math.round(v / 1_000)} k€`
  return `${v.toLocaleString('fr-FR')} €`
}

function formatPct(v: number | null): string {
  if (v == null) return '—'
  return `${v} %`
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // Récupération parallèle de toutes les données du projet
  const [projRes, indRes, temRes, partRes, evtRes, psRes] = await Promise.all([
    supabase.from('projets').select('*').eq('id', id).maybeSingle(),
    supabase.from('indicateurs').select('*').eq('projet_id', id).order('ordre'),
    supabase.from('temoignages').select('*').eq('projet_id', id).order('mise_en_avant', { ascending: false }),
    supabase.from('partenariats').select('*').eq('projet_id', id).order('ordre'),
    supabase.from('evenements').select('*').eq('projet_id', id).order('date_evenement'),
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
  const accentColor  = PS_COLORS[projet.ps_id] ?? OIF_BLUE

  // ─── Cercles d'impact ──────────────────────────────────────────────────────
  const ci = projet.cercles_impact ?? {}
  const cercleRows: TableRow[] = [
    new TableRow({
      children: [
        cell('Cercle', { bold: true, bg: OIF_DARK, color: WHITE, width: 2000 }),
        cell('Périmètre', { bold: true, bg: OIF_DARK, color: WHITE, width: 2400 }),
        cell('Chiffre-clé', { bold: true, bg: OIF_DARK, color: WHITE, width: 2400 }),
        cell('Type de preuve', { bold: true, bg: OIF_DARK, color: WHITE, width: 2560 }),
      ],
    }),
  ]
  if (ci.coeur) cercleRows.push(new TableRow({ children: [
    cell('Coeur', { bold: true, bg: accentColor, color: WHITE, width: 2000 }),
    cell('Investissement OIF', { width: 2400 }),
    cell(ci.coeur.valeur ?? formatBudget(projet.engagement_global), { bold: true, width: 2400 }),
    cell('Comptabilite OIF - verifie', { italic: true, width: 2560 }),
  ]}))
  if (ci.niveau1) cercleRows.push(new TableRow({ children: [
    cell('Niveau 1', { bold: true, bg: GRAY_LIGHT, width: 2000 }),
    cell(ci.niveau1.label ?? 'Beneficiaires directes', { width: 2400 }),
    cell(ci.niveau1.valeur ?? '—', { bold: true, color: accentColor, width: 2400 }),
    cell(ci.niveau1.type_preuve ?? 'mesure', { italic: true, width: 2560 }),
  ]}))
  if (ci.niveau2) cercleRows.push(new TableRow({ children: [
    cell('Niveau 2', { bold: true, bg: GRAY_LIGHT, width: 2000 }),
    cell(ci.niveau2.label ?? 'Familles transformees', { width: 2400 }),
    cell(ci.niveau2.valeur ?? '—', { bold: true, color: accentColor, width: 2400 }),
    cell(ci.niveau2.type_preuve ?? 'estimation', { italic: true, width: 2560 }),
  ]}))
  if (ci.niveau3) cercleRows.push(new TableRow({ children: [
    cell('Niveau 3', { bold: true, bg: GRAY_LIGHT, width: 2000 }),
    cell(ci.niveau3.label ?? 'Communautes mobilisees', { width: 2400 }),
    cell(ci.niveau3.description ?? '—', { width: 2400 }),
    cell(ci.niveau3.type_preuve ?? 'observation', { italic: true, width: 2560 }),
  ]}))
  if (ci.niveau4) cercleRows.push(new TableRow({ children: [
    cell('Niveau 4', { bold: true, bg: GRAY_LIGHT, width: 2000 }),
    cell(ci.niveau4.label ?? 'Espace francophone', { width: 2400 }),
    cell(ci.niveau4.description ?? '—', { width: 2400 }),
    cell(ci.niveau4.type_preuve ?? 'institutionnel', { italic: true, width: 2560 }),
  ]}))

  // ─── Indicateurs ───────────────────────────────────────────────────────────
  const indicRows: TableRow[] = [
    new TableRow({
      children: [
        cell('Valeur', { bold: true, bg: OIF_DARK, color: WHITE, width: 1800 }),
        cell('Indicateur', { bold: true, bg: OIF_DARK, color: WHITE, width: 5400 }),
        cell('Categorie', { bold: true, bg: OIF_DARK, color: WHITE, width: 2160 }),
      ],
    }),
    ...indicateurs.map((ind, i) => new TableRow({
      children: [
        cell(
          ind.valeur_pourcentage != null
            ? formatPct(ind.valeur_pourcentage)
            : ind.valeur_numerique != null
              ? `${ind.valeur_numerique.toLocaleString('fr-FR')} ${ind.unite ?? ''}`.trim()
              : '—',
          { bold: true, color: accentColor, bg: i % 2 === 0 ? WHITE : GRAY_LIGHT, width: 1800 }
        ),
        cell(ind.libelle, { bg: i % 2 === 0 ? WHITE : GRAY_LIGHT, width: 5400 }),
        cell((ind.categorie ?? '').replaceAll('_', ' '), { italic: true, bg: i % 2 === 0 ? WHITE : GRAY_LIGHT, width: 2160 }),
      ],
    })),
  ]

  // ─── Document ──────────────────────────────────────────────────────────────
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Arial', size: 20, color: OIF_DARK } },
      },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 }, // 2 cm
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'ORGANISATION INTERNATIONALE DE LA FRANCOPHONIE', bold: true, size: 16, color: OIF_BLUE, font: 'Arial' }),
                new TextRun({ text: '    |    Fiche d\'impact · ' + (projet.code_officiel ?? id), size: 16, color: '888888', font: 'Arial' }),
              ],
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: OIF_BLUE, space: 1 } },
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'CREXE 2025 · Donnees validees et publiees    ', size: 16, color: '888888', font: 'Arial' }),
                new TextRun({ text: 'Page ', size: 16, color: '888888', font: 'Arial' }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '888888', font: 'Arial' }),
              ],
              alignment: AlignmentType.RIGHT,
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: GRAY_MID, space: 1 } },
            }),
          ],
        }),
      },
      children: [
        // ── Titre principal
        new Paragraph({
          children: [
            new TextRun({ text: projet.nom, bold: true, size: 48, color: accentColor, font: 'Arial' }),
          ],
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: projet.accroche ?? '', italics: true, size: 24, color: '555555', font: 'Arial' }),
          ],
          spacing: { after: 80 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `${ps?.id ?? ''} \u00B7 ${ps?.nom ?? ''} \u00B7 Exercice ${projet.annee_exercice}`,
              size: 18, color: accentColor, bold: true, font: 'Arial',
            }),
          ],
          spacing: { after: 400 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: accentColor, space: 1 } },
        }),

        // ── 1. Fiche signaletique
        sectionTitle('1 · Fiche signaletique', accentColor),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 6240],
          rows: [
            new TableRow({ children: [
              cell('Intitule', { bold: true, bg: GRAY_LIGHT, width: 3120 }),
              cell(projet.nom, { width: 6240 }),
            ]}),
            new TableRow({ children: [
              cell('Programme', { bold: true, bg: GRAY_LIGHT, width: 3120 }),
              cell(`${ps?.id ?? '—'} — ${ps?.nom ?? ''}`, { width: 6240 }),
            ]}),
            new TableRow({ children: [
              cell('Exercice', { bold: true, bg: GRAY_LIGHT, width: 3120 }),
              cell(String(projet.annee_exercice), { width: 6240 }),
            ]}),
            new TableRow({ children: [
              cell('Budget engage', { bold: true, bg: GRAY_LIGHT, width: 3120 }),
              cell(
                `${formatBudget(projet.budget_engage)} (budget modifie : ${formatBudget(projet.budget_modifie)})`,
                { width: 6240 }
              ),
            ]}),
            new TableRow({ children: [
              cell('Engagement global', { bold: true, bg: GRAY_LIGHT, width: 3120 }),
              cell(formatBudget(projet.engagement_global), { width: 6240 }),
            ]}),
            new TableRow({ children: [
              cell("Taux d'execution", { bold: true, bg: GRAY_LIGHT, width: 3120 }),
              cell(formatPct(projet.taux_execution), { bold: true, color: accentColor, width: 6240 }),
            ]}),
            new TableRow({ children: [
              cell('Couverture geographique', { bold: true, bg: GRAY_LIGHT, width: 3120 }),
              cell(`${projet.nombre_pays ?? '—'} pays`, { width: 6240 }),
            ]}),
            new TableRow({ children: [
              cell('Candidatures recues', { bold: true, bg: GRAY_LIGHT, width: 3120 }),
              cell(
                projet.nombre_projets_deposes != null ? `${projet.nombre_projets_deposes.toLocaleString('fr-FR')} projets deposes` : '—',
                { width: 6240 }
              ),
            ]}),
            new TableRow({ children: [
              cell('Projets retenus', { bold: true, bg: GRAY_LIGHT, width: 3120 }),
              cell(
                projet.nombre_projets_retenus != null ? `${projet.nombre_projets_retenus} nouveaux projets` : '—',
                { bold: true, color: accentColor, width: 6240 }
              ),
            ]}),
          ],
        }),

        // ── 2. Cercles d'impact
        new Paragraph({ children: [new PageBreak()] }),
        sectionTitle("2 · Les quatre cercles d'impact", accentColor),
        ...(projet.description ? [
          new Paragraph({
            children: [new TextRun({ text: projet.description, size: 20, color: '444444', font: 'Arial', italics: true })],
            spacing: { after: 200 },
          }),
        ] : []),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2000, 2400, 2400, 2560],
          rows: cercleRows,
        }),

        // ── 3. Indicateurs
        new Paragraph({ children: [new PageBreak()] }),
        sectionTitle('3 · Indicateurs de transformation', accentColor),
        new Paragraph({
          children: [new TextRun({
            text: "Les indicateurs ci-dessous sont issus de l'enquete de satisfaction menee aupres des beneficiaires directes du Fonds en 2025.",
            size: 19, color: '666666', font: 'Arial', italics: true,
          })],
          spacing: { after: 160 },
        }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [1800, 5400, 2160],
          rows: indicRows,
        }),

        // ── 4. Temoignages
        ...(temoignages.length > 0 ? [
          new Paragraph({ children: [new PageBreak()] }),
          sectionTitle('4 · Voix du terrain — temoignages sources', accentColor),
          new Paragraph({
            children: [new TextRun({
              text: 'Un visuel d\'impact sans voix humaine reste abstrait. Les temoignages ci-dessous sont verifiables via les liens officiels.',
              size: 19, color: '666666', font: 'Arial', italics: true,
            })],
            spacing: { after: 200 },
          }),
          ...temoignages.flatMap((t) => [
            new Paragraph({
              children: [
                new TextRun({ text: '\u201C' + t.citation + '\u201D', size: 22, color: OIF_DARK, italics: true, font: 'Arial' }),
              ],
              spacing: { before: 160, after: 60 },
              indent: { left: 720 },
              border: { left: { style: BorderStyle.SINGLE, size: 12, color: accentColor, space: 4 } },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '\u2014 ', size: 18, color: accentColor, font: 'Arial' }),
                ...(t.source_url ? [
                  new ExternalHyperlink({
                    link: t.source_url,
                    children: [new TextRun({ text: t.source ?? 'Source', size: 18, color: OIF_BLUE, style: 'Hyperlink', font: 'Arial' })],
                  }),
                ] : [
                  new TextRun({ text: t.source ?? '', size: 18, color: '888888', font: 'Arial' }),
                ]),
                ...(t.pays ? [new TextRun({ text: `   [${t.pays}]`, size: 16, color: accentColor, bold: true, font: 'Arial' })] : []),
              ],
              indent: { left: 720 },
              spacing: { after: 200 },
            }),
          ]),
        ] : []),

        // ── 5. Partenariats
        ...(partenariats.length > 0 ? [
          sectionTitle('5 · Partenariats et ancrage institutionnel', accentColor),
          ...partenariats.map((p) => new Paragraph({
            children: [
              new TextRun({ text: p.nom + (p.acronyme ? ` (${p.acronyme})` : '') + ' — ', bold: true, size: 20, font: 'Arial' }),
              new TextRun({ text: p.description ?? '', size: 20, font: 'Arial' }),
            ],
            spacing: { before: 80, after: 80 },
            bullet: { level: 0 },
          })),
        ] : []),

        // ── 6. Evenements
        ...(evenements.length > 0 ? [
          sectionTitle('6 · Jalons 2025', accentColor),
          ...evenements.map((e) => {
            const dateStr = e.date_evenement
              ? new Date(e.date_evenement).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
              : ''
            return new Paragraph({
              children: [
                ...(dateStr ? [new TextRun({ text: dateStr + ' — ', bold: true, size: 20, color: accentColor, font: 'Arial' })] : []),
                new TextRun({ text: e.titre, bold: true, size: 20, font: 'Arial' }),
                ...(e.description ? [new TextRun({ text: ' : ' + e.description, size: 20, font: 'Arial' })] : []),
              ],
              spacing: { before: 80, after: 80 },
              bullet: { level: 0 },
            })
          }),
        ] : []),

        // ── 7. Note methodologique
        new Paragraph({ children: [new PageBreak()] }),
        sectionTitle('7 · Note methodologique', accentColor),
        new Paragraph({
          children: [new TextRun({ text: 'Palette chromatique', bold: true, size: 22, font: 'Arial' })],
          spacing: { before: 160, after: 60 },
        }),
        new Paragraph({
          children: [new TextRun({
            text: `Couleur principale du programme : #${accentColor}. Bleu OIF (#003DA5) pour les elements institutionnels ; or (#D4A017) pour les chiffres-chocs.`,
            size: 19, color: '555555', font: 'Arial',
          })],
          spacing: { after: 120 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Hierarchie de preuve', bold: true, size: 22, font: 'Arial' })],
          spacing: { before: 120, after: 60 },
        }),
        new Paragraph({
          children: [new TextRun({
            text: 'Mesure : donnees enquete directe. Estimation : projection methodologique avec hypothese. Observation : constats de missions terrain. Institutionnel : effets documentes au niveau des politiques publiques.',
            size: 19, color: '555555', font: 'Arial',
          })],
          spacing: { after: 200 },
        }),

        // ── 8. Zone libre
        sectionTitle("8 · Zone libre pour annotations", OIF_DARK),
        new Paragraph({
          children: [new TextRun({ text: 'Cet espace est laisse vierge pour permettre a l\'equipe communication OIF d\'ajouter des elements specifiques a chaque usage (declinaison LinkedIn, note d\'information interne, presentation bailleur…)', size: 19, color: '999999', italics: true, font: 'Arial' })],
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
      ],
    }],
  })

  const buffer = await Packer.toBuffer(doc)
  const filename = `CREXE_2025_${projet.code_officiel ?? id}_fiche_impact.docx`
  // Conversion Buffer → Uint8Array pour compatibilité NextResponse
  const uint8 = new Uint8Array(buffer)

  return new NextResponse(uint8, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(buffer.byteLength),
    },
  })
}
