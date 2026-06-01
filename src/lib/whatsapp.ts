import { getEnv } from './env';
import { CartItem } from '@/hooks/use-cart';

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
 * Generate a WhatsApp message URL with purchase details
 */
export function generateWhatsAppLink(cart: CartItem[], total: number, orderId: string): string {
  const whatsappNumber = getEnv('WHATSAPP_NUMBER');

  // Create the message with order details
  let message = `Olá! Gostaria de confirmar meu pedido na loja Artes Indígenas.\n\n`;

  // Add order details
  message += `*Número do Pedido:* ${orderId}\n`;
  message += `*Data:* ${new Date().toLocaleDateString('pt-BR')}\n\n`;

  // Add items
  message += `*Itens do pedido:*\n`;
  cart.forEach(item => {
    message += `- ${item.name} (${item.quantity}x) - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
  });

  // Add total
  message += `\n*Total: R$ ${total.toFixed(2)}*\n\n`;

  // Add payment instructions
  message += `*Instruções de pagamento:*\n`;
  message += `1. Utilize o código Pix gerado no site para realizar o pagamento\n`;
  message += `2. Envie o comprovante como resposta a esta mensagem\n`;
  message += `3. Aguarde a confirmação da loja\n\n`;

  // Add note
  message += `Caso já tenha realizado o pagamento, por favor anexe o comprovante. Obrigado!`;

  return buildWhatsAppUrl(whatsappNumber, message);
}

/**
 * Generate a random order ID
 */
export function generateOrderId(): string {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${timestamp}${random}`;
}