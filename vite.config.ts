import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      port: 5173,
      strictPort: true,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5173,
      },
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 1000, // Meningkatkan batas limit warning menjadi 1000kB
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Memisahkan library node_modules menjadi chunk tersendiri agar loading Vercel lebih cepat
            if (id.includes('node_modules')) {
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts'; // Pisahkan library grafik
              }
              if (id.includes('@google/generative-ai') || id.includes('gemini') || id.includes('@google/genai')) {
                return 'vendor-ai'; // Pisahkan SDK Gemini AI
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons'; // Pisahkan ikon
              }
              return 'vendor-core'; // Sisanya digabung ke core vendor
            }
          }
        }
      }
    }
  };
});
