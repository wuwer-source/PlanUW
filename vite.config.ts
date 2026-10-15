import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // Na GitHub Pages repozytorium jest serwowane z podfolderu np. '/PlanUW/'.
  // W środowisku GitHub Actions zmienna GITHUB_REPOSITORY to np. 'wuwer-source/PlanUW'.
  // W AI Studio (dev/preview) używamy './' lub '/', dzięki czemu aplikacja działa w obu miejscach bez białego ekranu.
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const base = process.env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : './';

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
