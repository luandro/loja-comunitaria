import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface Body {
  nome: string;
  cidade: string;
  chave: string;
  valor: number;
  txid?: string;
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

function buildBrCode({ nome, cidade, chave, valor, txid }: Body): string {
  const merchantAccount =
    tlv('00', 'br.gov.bcb.pix') + tlv('01', chave.trim());

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as Body;

    if (!body?.nome || !body?.cidade || !body?.chave || typeof body.valor !== 'number') {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const brCode = buildBrCode(body);

    // Render QR via a free image endpoint (no API key, generous limits).
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(brCode)}`;

    return new Response(JSON.stringify({ qrCode, brCode }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[generate-pix] error', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
