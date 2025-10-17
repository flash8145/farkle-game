// ==============================================================================
// ENVIRONMENT VARIABLES HELPER
// ==============================================================================
// Type-safe access to environment variables
// Validates that required variables are present
// ==============================================================================

/**
 * Environment variable configuration
 */
export const env = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5186/api',
  
  // Environment
  environment: (process.env.NEXT_PUBLIC_ENV || 'development') as 'development' | 'production' | 'staging',
  isDevelopment: process.env.NEXT_PUBLIC_ENV !== 'production',
  isProduction: process.env.NEXT_PUBLIC_ENV === 'production',
  
  // Debug Mode
  debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
  
  // Game Settings
  pollInterval: parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL || '2000', 10),
  enableAI: process.env.NEXT_PUBLIC_ENABLE_AI !== 'false',
  
  // Feature Flags
  enableExperiments: process.env.NEXT_PUBLIC_ENABLE_EXPERIMENTS === 'true',
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
} as const;

/**
 * Validates that all required environment variables are present
 * Call this on app initialization
 */
export function validateEnv(): void {
  const required = [
    'NEXT_PUBLIC_API_URL',
  ];

  const missing = required.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('\n💡 Create a .env.local file with the required variables');
    console.error('   See .env.example for a template\n');
  }
}

/**
 * Logs environment configuration (for debugging)
 */
export function logEnvConfig(): void {
  if (!env.debug) return;

  console.group('🔧 Environment Configuration');
  console.log('Environment:', env.environment);
  console.log('API URL:', env.apiUrl);
  console.log('Debug Mode:', env.debug);
  console.log('Poll Interval:', env.pollInterval + 'ms');
  console.log('AI Enabled:', env.enableAI);
  console.groupEnd();
}

/**
 * Get API base URL
 */
export function getApiUrl(): string {
  return env.apiUrl;
}

/**
 * Check if running in development
 */
export function isDev(): boolean {
  return env.isDevelopment;
}

/**
 * Check if running in production
 */
export function isProd(): boolean {
  return env.isProduction;
}

// Export as default
export default env;