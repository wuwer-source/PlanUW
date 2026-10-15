import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({command}) => {
  // Podczas budowania na GitHub Pages (npm run build) używamy '/PlanUW/',
  // a w lokalnym podglądzie (npm run dev) używamy '/', dzięki czemu działa w obu środowiskach.
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'PlanUW';
  const base = process.env.GITHUB_ACTIONS || command === 'build' ? `/${repoName}/` : '/';

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
