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
      // The preview proxy does not expose Vite's WebSocket upgrade endpoint.
      // Keep HMR off so @vite/client cannot open a socket that immediately closes.
      hmr: false,
      // Avoid file-watcher churn in the hosted preview; edits still trigger server restarts.
      watch: null,
    },
  };
});
