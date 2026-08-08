// Detect environment
var isProduction = process.env.NODE_ENV === 'production';
// Set API base based on environment
var apiBase = isProduction
    ? 'https://api.moifone.com' // Production
    : 'http://localhost:5010'; // Development
var config = {
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
console.log("[Capacitor] Dashboard Environment: ".concat(isProduction ? 'PRODUCTION' : 'DEVELOPMENT'));
console.log("[Capacitor] API Base: ".concat(apiBase));
export default config;
