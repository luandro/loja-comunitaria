import { getPixEnv } from './env';

export interface PixCodeResult {
  qrCode: string;
  brCode: string;
}

// EMV TLV helper: ID (2 digits) + LEN (2 digits) + VALUE
const tlv = (id: string, value: string) =>
  `${id}${value.length.toString().padStart(2, '0')}${value}`;

// CRC16-CCITT-FALSE (poly 0x1021, init 0xFFFF) — required by the PIX BR Code spec.
function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Strip accents and uppercase – PIX merchant fields must be ASCII.
const sanitize = (s: string, max: number) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .slice(0, max)
    .toUpperCase();

interface BrCodeInput {
  nome: string;
  cidade: string;
  chave: string;
  valor: number;
  txid?: string;
}

export function buildBrCode({ nome, cidade, chave, valor, txid }: BrCodeInput): string {
  const merchantAccount = tlv('00', 'br.gov.bcb.pix') + tlv('01', chave.trim());
  const additionalData = tlv('05', (txid || '***').slice(0, 25));

  const payloadNoCrc =
    tlv('00', '01') +
    tlv('26', merchantAccount) +
    tlv('52', '0000') +
    tlv('53', '986') +
    (valor > 0 ? tlv('54', valor.toFixed(2)) : '') +
    tlv('58', 'BR') +
    tlv('59', sanitize(nome, 25)) +
    tlv('60', sanitize(cidade, 15)) +
    tlv('62', additionalData) +
    '6304';

  return payloadNoCrc + crc16(payloadNoCrc);
}

/**
 * Generate a Pix BR Code + QR image URL entirely on the client.
 * No backend involved — the store stays 100% static.
 */
export async function generatePixCode(amount: number): Promise<PixCodeResult> {
  const env = getPixEnv();

  const brCode = buildBrCode({
    nome: env.RECIPIENT_NAME,
    cidade: env.RECIPIENT_CITY,
    chave: env.RECIPIENT_KEY,
    valor: Number(amount.toFixed(2)),
    txid: `TX${Date.now()}`,
  });

  const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(brCode)}`;

  return { qrCode, brCode };
}
