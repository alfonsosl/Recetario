import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages sirve la web en /<repo>/ (BASE_PATH lo define el workflow); en local y en el APK es '/'.
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  server: { host: true }, // accesible desde el móvil en la red local
});
