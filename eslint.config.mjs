import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".claude/**",
  ]),
  // ── Règles désactivées intentionnellement ─────────────────────────────────
  {
    rules: {
      // Faux positifs sur le pattern useEffect(() => { charger() }, [charger])
      // où `charger` est un useCallback stable qui appelle setState en interne.
      // Ce pattern est correct et recommandé pour la data fetching React.
      "react-hooks/set-state-in-effect": "off",

      // Le français utilise des apostrophes (l'OIF, d'éducation, etc.).
      // Forcer &apos; partout nuirait à la lisibilité du code JSX.
      "react/no-unescaped-entities": "off",

      // React 19 — faux positifs dans les fonctions async (SSE streaming,
      // event handlers). Date.now() et les mutations de variables locales
      // sont légitimes hors du cycle de rendu React.
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
    },
  },
]);

export default eslintConfig;
