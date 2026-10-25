import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, MessageSquare } from 'lucide-react';
import { useStore } from '@/hooks/use-store';
import { buildPixPayload } from '@/lib/pix';

interface PixPanelProps {
  amount: number;
  reference: string;
  /** true = Pix covers products only; freight is arranged separately. */
  freightNote: boolean;
  /** WhatsApp link for the "Já paguei — enviar pedido" action. */
  whatsappLink: string;
  onSend: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  canSend: boolean;
}

/**
 * Automatic Pix block. Everything is generated in the browser: the BR Code
 * is built locally and the QR is rendered with a local library — the payload
 * is never sent to any service. There is no payment verification: "Já paguei"
 * is only the customer's declaration, and the receipt goes through WhatsApp.
 */
export const PixPanel = ({
  amount,
  reference,
  freightNote,
  whatsappLink,
  onSend,
  canSend,
}: PixPanelProps) => {
  const store = useStore();
  const [qr, setQr] = useState('');
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const payload = buildPixPayload({
    key: store.pix.key,
    recipientName: store.pix.recipientName,
    recipientCity: store.pix.recipientCity,
    amount,
    reference,
  });

  useEffect(() => {
    let cancelled = false;
    setCopied(false);
    if (!payload) {
      setQr('');
      return;
    }
    QRCode.toDataURL(payload, { margin: 1, width: 220 })
      .then((url) => {
        if (!cancelled) setQr(url);
      })
      .catch(() => {
        if (!cancelled) setQr('');
      });
    return () => {
      cancelled = true;
    };
  }, [payload]);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  // Incomplete configuration → no Pix at all, never fake payment data.
  if (!payload) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 4000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section aria-labelledby="pix-title" className="mt-8 rounded-lg bg-white p-5 shadow-sm">
      <h2 id="pix-title" className="text-lg font-semibold text-forest-900">
        {store.t('pay_with_pix')}
      </h2>

      <p className="mt-2 text-3xl font-bold text-forest-900">{store.formatPrice(amount)}</p>
      {freightNote && (
        <p className="mt-1 text-sm text-forest-700">{store.t('freight_separate_note')}</p>
      )}

      <div className="mt-4 flex justify-center">
        {qr ? (
          <img
            src={qr}
            alt={store.t('pix_qr_alt')}
            width={220}
            height={220}
            className="rounded border border-sand-200"
          />
        ) : (
          <p className="text-sm text-forest-600">{store.t('pix_generating')}</p>
        )}
      </div>

      {/* On mobile the banking app is on the same phone: copia-e-cola first. */}
      <button
        type="button"
        onClick={copy}
        className={`btn mt-4 flex w-full items-center justify-center ${
          copied ? 'bg-forest-100 text-forest-900 border border-forest-300' : 'btn-primary'
        }`}
        aria-live="polite"
      >
        {copied ? <Check className="mr-2 h-5 w-5" /> : <Copy className="mr-2 h-5 w-5" />}
        {copied ? store.t('pix_copied_check') : store.t('copy_pix_code')}
      </button>

      {store.pix.instruction && (
        <p className="mt-3 whitespace-pre-line text-sm text-forest-700">{store.pix.instruction}</p>
      )}

      <a
        href={canSend ? whatsappLink : undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!canSend}
        onClick={onSend}
        className={`btn mt-5 flex w-full items-center justify-center text-base ${
          canSend ? 'btn-primary' : 'pointer-events-none bg-sand-200 text-forest-600'
        }`}
      >
        <MessageSquare className="mr-2 h-5 w-5" aria-hidden />
        {store.t('paid_send_order')}
      </a>
      <p className="mt-2 text-center text-sm text-forest-700">{store.t('receipt_hint')}</p>
    </section>
  );
};
