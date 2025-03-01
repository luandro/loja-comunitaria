import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Recipient information - normally these would come from environment variables
const PIX_RECIPIENT_NAME = "Artes Indígenas";
const PIX_RECIPIENT_CITY = "São Paulo";
const PIX_RECIPIENT_KEY = "example@email.com";

// Mock data for testing purposes
const MOCK_QR_CODE_URL = "https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=00020126330014BR.GOV.BCB.PIX0111example.com52040000530398654040.005802BR5913Artes+Indigenas6008Sao+Paulo62070503***6304E2CA";
const MOCK_BR_CODE = "00020126330014BR.GOV.BCB.PIX0111example.com52040000530398654040.005802BR5913Artes+Indigenas6008Sao+Paulo62070503***6304E2CA";

interface PixPaymentHookProps {
  amount: number;
}

export const usePixPayment = ({ amount }: PixPaymentHookProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [pixCopyCode, setPixCopyCode] = useState<string | null>(null);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const generatePixPaymentInfo = async () => {
    console.log("[PIX] Starting payment generation for amount:", amount);
    setIsLoading(true);
    try {
      // Common parameters for both API calls
      const baseParams = {
        nome: PIX_RECIPIENT_NAME,
        cidade: PIX_RECIPIENT_CITY,
        chave: PIX_RECIPIENT_KEY,
        valor: amount.toFixed(2),
        txid: `TX${Date.now()}` // Generate a simple unique transaction ID
      };
      
      console.log("[PIX] Using base parameters:", baseParams);
      
      try {
        // Make two parallel API calls - one for QR code and one for BR code
        const qrParams = new URLSearchParams({
          ...baseParams,
          saida: "qr"
        });
        
        const brParams = new URLSearchParams({
          ...baseParams,
          saida: "br"
        });
        
        const qrUrl = `https://gerarqrcodepix.com.br/api/v1?${qrParams.toString()}`;
        const brUrl = `https://gerarqrcodepix.com.br/api/v1?${brParams.toString()}`;
        
        console.log("[PIX] Calling Pix API for QR code at:", qrUrl);
        console.log("[PIX] Calling Pix API for BR code at:", brUrl);
        
        // Execute both requests in parallel
        const [qrResponse, brResponse] = await Promise.all([
          fetch(qrUrl),
          fetch(brUrl)
        ]);
        
        console.log("[PIX] QR code response status:", qrResponse.status);
        console.log("[PIX] BR code response status:", brResponse.status);
        
        if (!qrResponse.ok || !brResponse.ok) {
          throw new Error(`API responded with error status`);
        }
        
        const qrData = await qrResponse.json();
        const brData = await brResponse.json();
        
        console.log("[PIX] QR code data received:", qrData);
        console.log("[PIX] BR code data received:", brData);
        
        if (qrData && qrData.qr_code && brData && brData.br_code) {
          setPixQrCode(qrData.qr_code);
          setPixCopyCode(brData.br_code);
          setCheckoutComplete(true);
          toast({
            title: "Pedido realizado com sucesso!",
            description: "Escaneie o QR Code ou copie o código Pix para finalizar o pagamento.",
          });
        } else {
          throw new Error("Dados de pagamento não encontrados na resposta");
        }
      } catch (apiError) {
        // If the real API fails, use the mock data for demonstration
        console.error("[PIX] Error calling real Pix API:", apiError);
        console.log("[PIX] Using mock payment data instead");
        
        setPixQrCode(MOCK_QR_CODE_URL);
        setPixCopyCode(MOCK_BR_CODE);
        setCheckoutComplete(true);
        toast({
          title: "Pedido realizado com sucesso!",
          description: "Escaneie o QR Code ou copie o código Pix para finalizar o pagamento. (Modo demonstração)",
        });
      }
    } catch (error) {
      console.error("[PIX] Error generating Pix payment data:", error);
      toast({
        title: "Erro ao gerar dados de pagamento",
        description: "Não foi possível gerar os dados para pagamento Pix. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (pixCopyCode) {
      try {
        console.log("[PIX] Attempting to copy code to clipboard:", pixCopyCode.substring(0, 20) + "...");
        await navigator.clipboard.writeText(pixCopyCode);
        setIsCopied(true);
        toast({
          description: "Código Pix copiado para a área de transferência!",
        });
        
        // Reset the copied state after 3 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 3000);
      } catch (err) {
        console.error("[PIX] Error copying code:", err);
        toast({
          variant: "destructive",
          description: "Não foi possível copiar o código. Tente selecionar e copiar manualmente.",
        });
      }
    }
  };

  const resetPayment = () => {
    console.log("[PIX] Resetting payment state");
    setPixQrCode(null);
    setPixCopyCode(null);
    setCheckoutComplete(false);
    setIsCopied(false);
  };

  return {
    isLoading,
    pixQrCode,
    pixCopyCode,
    checkoutComplete,
    isCopied,
    generatePixPaymentInfo,
    copyToClipboard,
    resetPayment
  };
};