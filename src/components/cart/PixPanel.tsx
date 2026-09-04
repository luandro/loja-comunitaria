import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { AlertTriangle, Copy, MessageSquare } from 'lucide-react';
import { useStore } from '@/hooks/use-store';
import { useToast } from '@/hooks/use-toast';
import { buildPixPayload } from '@/lib/pix';
import { getWhatsAppCustomLink } from '@/lib/whatsapp';

interface PixPanelProps {
  subtotal: number;
  reference: string;
}

/**
 * Optional Pix mode. Everything is generated in the browser: the BR Code is
 * built locally and the QR is rendered with a local library — the payload is
 * never sent to any service. Payment never confirms availability.
 */
export const PixPanel = ({ subtotal, reference }: PixPanelProps) => {
  const store = useStore();
  const { toast } = useToast();
  const [qr, setQr] = useState('');

  const payload = store.pix.immediate
    ? buildPixPayload({
        key: store.pix.key,
        recipientName: store.pix.recipientName,
        recipientCity: store.pix.recipientCity,
        amount: subtotal,
        reference,
      })
    : '';

  useEffect(() => {
    let cancelled = false;
    if (!payload) {
      setQr('');
      return;
    }
    QRCode.toDataURL(payload, { margin: 1, width: 260 })
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

  // Incomplete configuration → no Pix at all, never fake payment data.
  if (!payload) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      toast({ description: store.t('pix_copied') });
    } catch {
      toast({ description: store.t('pix_copy_failed') });
    }
  };

  const receiptLink = store.contact.hasWhatsApp
    ? getWhatsAppCustomLink(
        `${store.storeName} — ${store.t('pix_reference')}: ${reference}\n${store.t(
          'pix_send_receipt',
        )}`,
        store.contact.whatsappNumber,
      )
    : '';

  return (
    <section className="mt-6 rounded-lg bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-forest-900">{store.t('pix_title')}</h2>

      <p className="mt-3 flex gap-2 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <span>{store.pix.confirmationNotice || store.t('pix_warning')}</span>
      </p>

      {store.pix.instruction && (
        <p className="mt-3 whitespace-pre-line text-sm text-forest-700">
          {store.pix.instruction}
        </p>
      )}

      <dl className="mt-4 space-y-1 text-sm text-forest-800">
        <div className="flex justify-between">
          <dt>{store.t('pix_amount')}</dt>
          <dd className="font-semibold">{store.formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>{store.t('pix_recipient')}</dt>
          <dd>{store.pix.recipientName}</dd>
        </div>
        <div className="flex justify-between">
          <dt>{store.t('pix_reference')}</dt>
          <dd>{reference}</dd>
        </div>
      </dl>

      <div className="mt-4 flex justify-center">
        {qr ? (
          <img
            src={qr}
            alt={store.t('pix_qr_alt')}
            width={260}
            height={260}
            className="rounded border border-sand-200"
          />
        ) : (
          <p className="text-sm text-forest-600">{store.t('pix_generating')}</p>
        )}
      </div>

      <label className="mt-4 block text-sm font-medium text-forest-800" htmlFor="pix-code">
        {store.t('pix_code_label')}
      </label>
      <textarea
        id="pix-code"
        readOnly
        value={payload}
        rows={3}
        className="mt-1 w-full rounded border border-sand-200 bg-sand-50 p-2 font-mono text-xs text-forest-800"
      />

      <button onClick={copy} className="btn btn-primary mt-3 flex w-full items-center justify-center">
        <Copy className="mr-2 h-4 w-4" />
        {store.t('pix_copy')}
      </button>

      {receiptLink && (
        <a
          href={receiptLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex w-full items-center justify-center rounded border border-sand-200 px-6 py-2 text-forest-800 transition hover:bg-sand-100"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          {store.t('pix_send_receipt')}
        </a>
      )}
    </section>
  );
};
