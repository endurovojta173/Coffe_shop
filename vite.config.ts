import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Coffe_shop/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.svg'],
      manifest: {
        name: 'Kavárna U Sousedů',
        short_name: 'U Sousedů',
        description: 'Věrnostní aplikace a katalog rodinné kavárny U Sousedů',
        theme_color: '#1C140D',
        background_color: '#1C140D',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: './app/home',
        icons: [
          {
            src: './favicon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          qr: ['qrcode.react', 'html5-qrcode'],
        },
      },
    },
  },
});
