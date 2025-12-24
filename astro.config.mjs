import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'url';

// https://astro.build/config
export default defineConfig({
  site: 'https://scalesketch.com', // Update with your actual domain
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false, // We'll handle base styles ourselves
    }),
    sitemap(),
  ],
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    ssr: {
      noExternal: ['lucide-react', 'react-hot-toast', 'recharts'],
    },
  },
});

