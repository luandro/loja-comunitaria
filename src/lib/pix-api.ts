import { supabase } from '@/integrations/supabase/client';
import { getPixEnv } from './env';

export interface PixCodeResult {
  qrCode: string;
  brCode: string;
}

/**
 * Generate a Pix QR code + copy-paste code via the `generate-pix` edge function.
 * The edge function proxies https://gerarqrcodepix.com.br/api/v1 to avoid CORS
 * and to keep recipient data centralized server-side.
 */
export async function generatePixCode(amount: number): Promise<PixCodeResult> {
  const env = getPixEnv();

  const { data, error } = await supabase.functions.invoke('generate-pix', {
    body: {
      nome: env.RECIPIENT_NAME,
      cidade: env.RECIPIENT_CITY,
      chave: env.RECIPIENT_KEY,
      valor: Number(amount.toFixed(2)),
      txid: `TX${Date.now()}`,
    },
  });

  if (error) {
    console.error('[pix-api] edge function error', error);
    throw new Error(error.message || 'Falha ao gerar código Pix');
  }
  if (!data?.qrCode || !data?.brCode) {
    console.error('[pix-api] invalid response', data);
    throw new Error('Resposta inválida ao gerar código Pix');
  }

  return { qrCode: data.qrCode as string, brCode: data.brCode as string };
}
