import type { CapacitorConfig } from '@capacitor/cli';

// The app ships the built `dist/` inside the APK — no `server.url`, or the WebView
// would load a remote page instead of the bundled UI.
//
// The API base is baked into the web build at `npm run build` time from
// .env.production (VITE_API_BASE=https://api.moifone.com). Nothing API-related
// belongs in this file.
//
// androidScheme 'https' makes the WebView origin `https://localhost`, which is
// already allowed in the backend's CORS_ORIGINS.
const config: CapacitorConfig = {
  appId: 'com.moifone.salonlaundry.dashboard',
  appName: 'Salon Laundry Dashboard',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
