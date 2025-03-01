import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getPixEnv } from '@/lib/env';
import { generatePixCode } from '@/lib/pix-api';

interface PixPaymentHookProps {
  amount: number;
}

export const usePixPayment = ({ amount }: PixPaymentHookProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [pixCopyCode, setPixCopyCode] = useState<string | null>(null);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLocallyGenerated, setIsLocallyGenerated] = useState(false);
  const { toast } = useToast();

  // Load environment variables when component mounts
  useEffect(() => {
    const env = getPixEnv();
    console.log("[PIX] Environment loaded:", {
      recipient: env.RECIPIENT_NAME,
      city: env.RECIPIENT_CITY,
      key: `${env.RECIPIENT_KEY.substring(0, 3)}...${env.RECIPIENT_KEY.substring(env.RECIPIENT_KEY.length - 3)}`, // Mask the key for security
      apiUrl: env.API_URL
    });
  }, []);

  const generatePixPaymentInfo = async () => {
    console.log("[PIX] Starting payment generation for amount:", amount);
    setIsLoading(true);

    try {
      // Use our pix-api library to generate the code
      const result = await generatePixCode(amount);
      setPixQrCode(result.qrCode);
      setPixCopyCode(result.brCode);
      setIsLocallyGenerated(result.isLocallyGenerated);
      setCheckoutComplete(true);

      toast({
        title: "Pedido realizado com sucesso!",
        description: result.isLocallyGenerated
          ? "Escaneie o QR Code ou copie o código Pix para finalizar o pagamento. (Código gerado localmente)"
          : "Escaneie o QR Code ou copie o código Pix para finalizar o pagamento.",
      });
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
        console.log("[PIX] Attempting to copy code to clipboard");
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
    setIsLocallyGenerated(false);
  };

  return {
    isLoading,
    pixQrCode,
    pixCopyCode,
    checkoutComplete,
    isCopied,
    isLocallyGenerated,
    generatePixPaymentInfo,
    copyToClipboard,
    resetPayment
  };
};