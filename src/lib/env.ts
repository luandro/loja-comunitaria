/**
 * Utility to safely access environment variables with fallbacks and warnings
 */

// Environment variable types
interface EnvVars {
  // PIX payment
  PIX_RECIPIENT_NAME: string;
  PIX_RECIPIENT_CITY: string;
  PIX_RECIPIENT_KEY: string;
  PIX_API_URL: string;

  // Contact info
  WHATSAPP_NUMBER: string;

  // Product data source
  GOOGLE_SPREADSHEET_ID: string;
  GOOGLE_SPREADSHEET_TAB: string;
}

// Default values for environment variables
const defaults: EnvVars = {
  PIX_RECIPIENT_NAME: "Artes Indígenas",
  PIX_RECIPIENT_CITY: "São Paulo",
  PIX_RECIPIENT_KEY: "example@email.com",
  PIX_API_URL: "https://gerarqrcodepix.com.br/api/v1",
  WHATSAPP_NUMBER: "5511999999999", // Default number, should be replaced in .env
  GOOGLE_SPREADSHEET_ID: "", // No default, must be set in .env
  GOOGLE_SPREADSHEET_TAB: "produtos" // Default tab name
};

/**
 * Get an environment variable with fallback to default value
 * Logs a warning if the environment variable is missing
 */
export function getEnv<K extends keyof EnvVars>(key: K): string {
  const value = import.meta.env[`VITE_${key}`] as string | undefined;

  if (!value) {
    console.warn(
      `[ENV] Missing environment variable: VITE_${key}. Using default value: ${defaults[key]}`
    );
    return defaults[key];
  }

  return value;
}

/**
 * Returns all environment variables needed for PIX payments
 */
export function getPixEnv() {
  return {
    RECIPIENT_NAME: getEnv('PIX_RECIPIENT_NAME'),
    RECIPIENT_CITY: getEnv('PIX_RECIPIENT_CITY'),
    RECIPIENT_KEY: getEnv('PIX_RECIPIENT_KEY'),
    API_URL: getEnv('PIX_API_URL'),
  };
}