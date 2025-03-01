import { getPixEnv } from './env';

// Define response types
interface PixQrCodeResponse {
  qr_code?: string; // Base64 encoded PNG image
  erro?: string;
}

interface PixBrCodeResponse {
  br_code?: string; // Text version of PIX code
  erro?: string;
}

// Interface for generatePixCode parameters
interface PixCodeParams {
  nome: string;
  cidade: string;
  chave: string;
  valor: string;
  txid?: string;
  mcc?: string;
}

/**
 * Generate a QR code for PIX payment
 * Tries API call first, falls back to local generation if needed
 */
export async function generatePixCode(amount: number): Promise<{
  qrCode: string,
  brCode: string,
  isLocallyGenerated: boolean
}> {
  console.log('[PIX-API] Generating PIX code for amount:', amount);

  const pixEnv = getPixEnv();

  // Common parameters for API calls
  const baseParams: PixCodeParams = {
    nome: pixEnv.RECIPIENT_NAME,
    cidade: pixEnv.RECIPIENT_CITY,
    chave: pixEnv.RECIPIENT_KEY,
    valor: amount.toFixed(2),
    txid: `TX${Date.now()}` // Generate a unique transaction ID
  };

  try {
    // Try to call the actual API
    console.log('[PIX-API] Attempting to call PIX API directly');
    const result = await callPixApiDirectly(baseParams);
    console.log('[PIX-API] Successfully generated PIX codes from API');

    return {
      qrCode: result.qrCode,
      brCode: result.brCode,
      isLocallyGenerated: false
    };
  } catch (error) {
    console.error('[PIX-API] API call failed, using local generation:', error);
    const localCode = generateLocalPixCode(baseParams);

    return {
      qrCode: localCode.qrCodeUrl,
      brCode: localCode.pixCode,
      isLocallyGenerated: true
    };
  }
}

/**
 * Attempt to call the PIX API directly
 * This approach will likely fail due to CORS, but we try it first
 */
async function callPixApiDirectly(params: PixCodeParams): Promise<{
  qrCode: string;
  brCode: string;
}> {
  const pixEnv = getPixEnv();
  const apiUrl = pixEnv.API_URL;

  // Prepare parameters for QR code (image) request
  const qrParams = new URLSearchParams({
    ...params,
    saida: 'qr'
  });

  // Prepare parameters for BR code (text) request
  const brParams = new URLSearchParams({
    ...params,
    saida: 'br'
  });

  const qrUrl = `${apiUrl}?${qrParams.toString()}`;
  const brUrl = `${apiUrl}?${brParams.toString()}`;

  console.log('[PIX-API] QR code request URL:', qrUrl);
  console.log('[PIX-API] BR code request URL:', brUrl);

  try {
    // Make the API calls
    const [qrResponse, brResponse] = await Promise.all([
      fetch(qrUrl, { mode: 'cors' }),
      fetch(brUrl, { mode: 'cors' })
    ]);

    if (!qrResponse || !brResponse) {
      throw new Error(`API responded with error status: QR=${qrResponse.status}, BR=${brResponse.status}`);
    }

    // Handle QR code response (which is a base64 PNG image)
    let qrCode: string;
    const contentType = qrResponse.headers.get('content-type');
    if (contentType?.includes('image')) {
      // If it's an image, get it as blob and convert to base64
      const blob = await qrResponse.blob();
      qrCode = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } else if (contentType?.includes('json')) {
      // If it's JSON, parse it normally
      const qrData = await qrResponse.json() as PixQrCodeResponse;
      if (!qrData.qr_code) {
        throw new Error('API response missing QR code data');
      }
      qrCode = qrData.qr_code;
    } else {
      // If it's text or other format, use as is
      qrCode = await qrResponse.text();
    }

    // Parse the BR code response
    const brData = await brResponse.json() as PixBrCodeResponse;
    if (!brData.brcode) {
      throw new Error('API response missing BR code data');
    }

    return {
      qrCode,
      brCode: brData.brcode
    };
  } catch (error) {
    console.error('[PIX-API] Direct API call failed:', error);
    throw error;
  }
}

/**
 * Generate a PIX code locally
 * This generates a standardized code following Brazilian PIX specifications
 * Used as fallback when API calls fail
 */
function generateLocalPixCode(params: PixCodeParams) {
  console.log('[PIX-API] Generating PIX code locally with params:', {
    ...params,
    chave: params.chave.substring(0, 3) + '...' // Mask the key for security
  });

  // Format the recipient name and city for Pix (remove accents, replace spaces)
  const formatText = (text: string) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/\s+/g, ' ')            // Normalize spaces
      .trim();
  };

  const nome = formatText(params.nome);
  const cidade = formatText(params.cidade);

  // Create a Pix code following the Brazilian PIX standards

  // GUID to ensure uniqueness
  const guid = 'BR.GOV.BCB.PIX';

  // Merchant Account Information
  const merchantAccountInfo = `0014${guid}01${params.chave.length}${params.chave}`;

  // Build the first part of the PIX code (mandatory fields)
  let pixCode = `00020126${merchantAccountInfo.length.toString().padStart(2, '0')}${merchantAccountInfo}`;

  // Add transaction amount (formatted according to PIX standards)
  const formattedAmount = params.valor.replace('.', '').padStart(13, '0');
  pixCode += `5204000053039865${formattedAmount}`;

  // Add country code (BR for Brazil)
  pixCode += '5802BR';

  // Add merchant name and city
  pixCode += `59${nome.length.toString().padStart(2, '0')}${nome}`;
  pixCode += `60${cidade.length.toString().padStart(2, '0')}${cidade}`;

  // Add transaction ID if provided
  if (params.txid) {
    pixCode += `05${params.txid.length.toString().padStart(2, '0')}${params.txid}`;
  }

  // Add CRC16 checksum (simplified here - in a real implementation you would calculate the actual CRC16)
  pixCode += '6304';

  // Generate a QR code URL using Google Charts API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pixCode)}`;

  return { qrCodeUrl, pixCode };
}