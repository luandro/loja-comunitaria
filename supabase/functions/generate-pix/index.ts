import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface Body {
  nome: string;
  cidade: string;
  chave: string;
  valor: number;
  txid?: string;
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

    const base = new URLSearchParams({
      nome: body.nome,
      cidade: body.cidade,
      chave: body.chave,
      valor: body.valor.toFixed(2),
    });
    if (body.txid) base.set('txid', body.txid);

    const apiUrl = 'https://gerarqrcodepix.com.br/api/v1';

    // saida=br returns JSON with the BR (copy/paste) code
    const brUrl = `${apiUrl}?${base.toString()}&saida=br`;
    // saida=qr returns a PNG image
    const qrUrl = `${apiUrl}?${base.toString()}&saida=qr`;

    const [brRes, qrRes] = await Promise.all([fetch(brUrl), fetch(qrUrl)]);

    if (!brRes.ok || !qrRes.ok) {
      console.error('[generate-pix] upstream not ok', brRes.status, qrRes.status);
      return new Response(
        JSON.stringify({ error: 'Upstream Pix API error', br: brRes.status, qr: qrRes.status }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const brJson = await brRes.json();
    const brCode: string | undefined = brJson.brcode ?? brJson.br_code ?? brJson.pix;
    if (!brCode) {
      console.error('[generate-pix] missing brcode in response', brJson);
      return new Response(JSON.stringify({ error: 'Missing brcode in upstream response' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const qrBuf = new Uint8Array(await qrRes.arrayBuffer());
    // base64 encode without blowing the stack on large buffers
    let bin = '';
    for (let i = 0; i < qrBuf.length; i++) bin += String.fromCharCode(qrBuf[i]);
    const qrCode = `data:image/png;base64,${btoa(bin)}`;

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
