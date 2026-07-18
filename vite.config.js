import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/main.jsx'],
      refresh: true,
      // Deteksi APP_URL dari .env agar Vite tahu domain HTTPS yang dipakai
      // (Herd/Valet). Ini membantu Laravel menyisipkan asset URL yang benar.
      detectTls: process.env.APP_URL ? process.env.APP_URL.replace(/^https?:\/\//, '') : undefined,
    }),
    react(),
  ],
});
