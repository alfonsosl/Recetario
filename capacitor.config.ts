import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.alfonsosl.mediterraneo5',
  appName: 'Mediterráneo 5',
  webDir: 'dist',
  backgroundColor: '#fdfbf7',
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SystemBars: {
      // Inyecta --safe-area-inset-* para que cabecera y barra inferior no queden bajo las barras del sistema.
      insetsHandling: 'css',
      initialViewportFitValueHint: 'cover',
      // Iconos oscuros en la barra de estado (la cabecera de la app es clara).
      style: 'LIGHT',
    },
  },
};

export default config;
