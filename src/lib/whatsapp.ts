import { getEnv } from './env';

function buildWhatsAppUrl(phone: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
}

/**
 * Generate a general WhatsApp contact link.
 * Pass overrides (e.g. resolved from the Site_Content sheet) to prefer them
 * over the env-based defaults.
 */
export function getWhatsAppContactLink(overrides?: {
  number?: string;
  message?: string;
}): string {
  const whatsappNumber = overrides?.number?.trim() || getEnv('WHATSAPP_NUMBER');
  const whatsappMessage = overrides?.message?.trim() || getEnv('WHATSAPP_MESSAGE');
  return buildWhatsAppUrl(whatsappNumber, whatsappMessage);
}

/**
 * Generate a WhatsApp message URL with a custom message
 */
export function getWhatsAppCustomLink(message: string, numberOverride?: string): string {
  const whatsappNumber = numberOverride?.trim() || getEnv('WHATSAPP_NUMBER');
  return buildWhatsAppUrl(whatsappNumber, message);
}

/**
 * Reference code for an order request (not a confirmed order).
 */
export { generateReferenceCode as generateOrderId } from './order-request';
