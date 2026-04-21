// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  // ESLint est géré séparément (CI/pre-commit) — ne bloque pas le build Netlify
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
