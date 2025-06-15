import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Build çıktısının dist klasörüne gittiğini belirt
    sourcemap: true, // Hata ayıklama için source map oluştur
  },
  define: {
    'process.env': process.env, // Çevresel değişkenleri (örn. Firebase, Mapbox) erişilebilir yap
  },
  base: '/', // SPA için root path (Netlify ile uyumlu)
});
