/**
 * Utility to safely access environment variables.
 *
 * There are NO production defaults for store-specific values: a missing value
 * resolves to an empty string so the UI can hide the feature or surface a
 * diagnostics warning instead of showing fake contact/payment data.
 */

interface EnvVars {
  // Contact info (prefer the Conteudo_Site spreadsheet; env is a bootstrap fallback)
  WHATSAPP_NUMBER: string;
  WHATSAPP_MESSAGE: string;

  // Product data source
  GOOGLE_SPREADSHEET_ID: string;
  GOOGLE_SPREADSHEET_TAB: string;
  GOOGLE_SPREADSHEET_CONTENT_TAB: string;
}

/** Only structural defaults are allowed here — never store-specific content. */
const defaults: EnvVars = {
  WHATSAPP_NUMBER: '',
  WHATSAPP_MESSAGE: '',
  GOOGLE_SPREADSHEET_ID: '',
  GOOGLE_SPREADSHEET_TAB: 'Produtos',
  GOOGLE_SPREADSHEET_CONTENT_TAB: 'Conteudo_Site',
};

export function getEnv<K extends keyof EnvVars>(key: K): string {
  const value = import.meta.env[`VITE_${key}`] as string | undefined;
  if (!value) return defaults[key];
  return value;
}
