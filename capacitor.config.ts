import type { CapacitorConfig } from '@capacitor/cli';

// Detect environment
const isProduction = process.env.NODE_ENV === 'production'

// Set API base based on environment
const apiBase = isProduction
  ? 'https://api.moifone.com'  // Production
  : 'http://localhost:5010'     // Development

const config: CapacitorConfig = {
  appId: 'com.moifone.salonlaundry.dashboard',
  appName: 'Salon Laundry Dashboard',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: apiBase,
    cleartext: !isProduction,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

console.log(`[Capacitor] Dashboard Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
console.log(`[Capacitor] API Base: ${apiBase}`);

export default config;
