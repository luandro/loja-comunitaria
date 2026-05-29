import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

  const generatePixPaymentInfo = async () => {
    setIsLoading(true);
    try {
      const { qrCode, brCode } = await generatePixCode(amount);
      setPixQrCode(qrCode);
      setPixCopyCode(brCode);
      setCheckoutComplete(true);
      toast({
        title: 'Pedido realizado com sucesso!',
        description: 'Escaneie o QR Code ou copie o código Pix para finalizar o pagamento.',
      });
    } catch (error) {
      console.error('[PIX] generation failed', error);
      toast({
        title: 'Erro ao gerar pagamento',
        description: 'Não foi possível gerar o código Pix. Tente novamente em instantes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!pixCopyCode) return;
    try {
      await navigator.clipboard.writeText(pixCopyCode);
      setIsCopied(true);
      toast({ description: 'Código Pix copiado!' });
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      console.error('[PIX] clipboard failed', err);
      toast({
        variant: 'destructive',
        description: 'Não foi possível copiar. Selecione e copie manualmente.',
      });
    }
  };

  const resetPayment = () => {
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
    resetPayment,
  };
};
