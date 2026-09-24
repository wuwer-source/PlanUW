import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({command}) => {
  return {
    // Podczas budowania na GitHub Pages (npm run build) używamy '/PlanUW/',
    // a w lokalnym podglądzie (npm run dev) używamy '/', dzięki czemu podgląd tutaj nie jest białą stroną!
    base: command === 'build' ? '/PlanUW/' : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
