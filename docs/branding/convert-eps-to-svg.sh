#!/usr/bin/env bash
# ─── Conversion EPS → SVG pour les logos OIF ─────────────────────────────────
# Usage : bash docs/branding/convert-eps-to-svg.sh
# Prérequis : Inkscape (recommandé) ou Ghostscript + potrace
# ─────────────────────────────────────────────────────────────────────────────

set -e

SRC="docs/branding/sources"
DEST="public/assets/branding/oif"

mkdir -p "$DEST"

echo "─── Conversion EPS → SVG (logos OIF officiels) ──────────────────────────"

# Vérification de l'outil disponible
if command -v inkscape &>/dev/null; then
  TOOL="inkscape"
  echo "✓ Inkscape détecté"
elif command -v gs &>/dev/null; then
  TOOL="ghostscript"
  echo "✓ Ghostscript détecté (qualité inférieure à Inkscape)"
else
  echo "✗ Ni Inkscape ni Ghostscript trouvé."
  echo "  → Installation : brew install inkscape  (macOS)"
  echo "  → ou : sudo apt-get install inkscape    (Linux)"
  exit 1
fi

# ── Fonction de conversion ────────────────────────────────────────────────────
convert_eps() {
  local eps_file="$1"
  local svg_name="$2"
  local svg_path="$DEST/$svg_name"

  if [ ! -f "$SRC/$eps_file" ]; then
    echo "⚠ Fichier manquant : $SRC/$eps_file — ignoré"
    return
  fi

  echo -n "  Conversion $eps_file → $svg_name … "

  if [ "$TOOL" = "inkscape" ]; then
    inkscape \
      --export-type=svg \
      --export-filename="$svg_path" \
      "$SRC/$eps_file" 2>/dev/null
  else
    # Ghostscript : EPS → PS → conversion SVG via potrace (approximatif)
    gs -dBATCH -dNOPAUSE -dEPSCrop \
       -sDEVICE=svg \
       -sOutputFile="$svg_path" \
       "$SRC/$eps_file" 2>/dev/null
  fi

  # Post-traitement : ajout aria-label pour accessibilité
  if [ -f "$svg_path" ]; then
    # Ajoute aria-label sur la balise <svg> si absent
    sed -i.bak 's/<svg/<svg aria-label="Logo officiel de l'"'"'Organisation internationale de la Francophonie" role="img"/' "$svg_path"
    rm -f "${svg_path}.bak"
    echo "✓"
  else
    echo "✗ Échec"
  fi
}

# ── Conversions ───────────────────────────────────────────────────────────────
convert_eps "Logo_OIF_quadri.eps"              "logo-oif-quadri.svg"
convert_eps "Logo_OIF_quadri_texte_blanc.eps"  "logo-oif-quadri-texte-blanc.svg"
convert_eps "Logo_OIF_noir.eps"                "logo-oif-noir.svg"
convert_eps "Logo_OIF_blanc.eps"               "logo-oif-blanc.svg"

echo ""
echo "─── Résultat ────────────────────────────────────────────────────────────"
ls -lh "$DEST"/*.svg 2>/dev/null || echo "Aucun SVG produit."
echo ""
echo "⚠ Vérification manuelle requise après conversion :"
echo "  1. Ouvrir chaque SVG dans un navigateur et comparer au logo original"
echo "  2. Vérifier que les 6 couleurs du logotype sont exactes"
echo "  3. Vérifier les proportions (ratio ~3.5:1)"
echo "  4. Ajuster le viewBox si nécessaire"
