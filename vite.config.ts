import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production' || process.env.NODE_ENV === 'production';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // Modern browser target — avoids legacy polyfills
      target: 'es2020',
      // No sourcemaps in production (security + smaller output)
      sourcemap: false,
      // Fastest minifier
      minify: 'esbuild',
      // Skip compressed size report for faster build output
      reportCompressedSize: false,
      // Warn if any single chunk exceeds 500 kB
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          // Manual chunk strategy — each logical group loads independently
          manualChunks: (id) => {
            // Core React runtime — always loaded
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'react-vendor';
            }
            // Router
            if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router')) {
              return 'router';
            }
            // Clerk authentication SDK
            if (id.includes('node_modules/@clerk')) {
              return 'clerk';
            }
            // Animation library
            if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) {
              return 'motion';
            }
            // Icon library
            if (id.includes('node_modules/lucide-react')) {
              return 'icons';
            }
            // Supabase client
            if (id.includes('node_modules/@supabase')) {
              return 'supabase';
            }
          },
        },
      },
    },
    // Strip console.log and debugger in production (keep console.error for diagnostics)
    esbuild: isProd
      ? {
          drop: ['debugger'],
          pure: ['console.log'],
        }
      : {},
  };
});
