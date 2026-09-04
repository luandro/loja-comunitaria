/**
 * Client-side Pix BR Code (EMV QRCPS-MPM) generation.
 *
 * Everything happens in the browser: no backend, no serverless function and no
 * external QR image service. The payload is never sent anywhere.
 */

export interface PixConfig {
  key: string;
  recipientName: string;
  recipientCity: string;
}

export interface PixPayloadInput extends PixConfig {
  amount: number;
  reference: string;
}

const sanitize = (value: string, max: number) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 .,-]/g, '')
    .trim()
    .slice(0, max);

/** Reference codes must be alphanumeric for the txid field. */
const sanitizeTxid = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(0, 25) || '***';

const field = (id: string, value: string) =>
  `${id}${value.length.toString().padStart(2, '0')}${value}`;

/** CRC16/CCITT-FALSE, as required by the Pix specification. */
export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/** True when every value needed for a real Pix payload is present. */
export function isPixConfigValid(config: Partial<PixConfig>): config is PixConfig {
  return !!(
    config.key?.trim() &&
    config.recipientName?.trim() &&
    config.recipientCity?.trim()
  );
}

/**
 * Build a static Pix BR Code string. Returns an empty string when the
 * configuration is incomplete — never fabricated payment data.
 */
export function buildPixPayload(input: PixPayloadInput): string {
  if (!isPixConfigValid(input)) return '';
  const amount = Number.isFinite(input.amount) && input.amount > 0 ? input.amount : 0;
  if (amount <= 0) return '';

  const merchantAccount = field('00', 'BR.GOV.BCB.PIX') + field('01', input.key.trim());

  const payload =
    field('00', '01') +
    field('26', merchantAccount) +
    field('52', '0000') +
    field('53', '986') +
    field('54', amount.toFixed(2)) +
    field('58', 'BR') +
    field('59', sanitize(input.recipientName, 25) || 'RECEBEDOR') +
    field('60', sanitize(input.recipientCity, 15) || 'BRASIL') +
    field('62', field('05', sanitizeTxid(input.reference)));

  const base = `${payload}6304`;
  return `${base}${crc16(base)}`;
}
