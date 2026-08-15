import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 5200, // clear of the ERP client (5180) so both can run side by side
      // In development the ERP API is proxied, so src/api.js can leave VITE_API_BASE unset and
      // call a same-origin /api. In production VITE_API_BASE points at the ERP's own domain and
      // this proxy is not involved.
      proxy: {
        '/api': {
          target: env.API_TARGET || 'http://localhost:4100',
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: Number(env.PORT) || 4173,
      host: true, // Railway needs the server bound to 0.0.0.0, not localhost
      // Railway serves the app on its own hostname; without this, preview refuses the request.
      allowedHosts: true,
    },
  };
});
