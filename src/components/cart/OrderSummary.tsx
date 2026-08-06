import { MessageSquare } from 'lucide-react';
import { useStore } from '@/hooks/use-store';

interface OrderSummaryProps {
  subtotal: number;
  reference: string;
  canSubmit: boolean;
  whatsappLink: string;
  onRequest: () => void;
  onClearCart: () => void;
}

export const OrderSummary = ({
  subtotal,
  reference,
  canSubmit,
  whatsappLink,
  onRequest,
  onClearCart,
}: OrderSummaryProps) => {
  const store = useStore();
  const enabled = canSubmit && store.contact.hasWhatsApp;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
      <h2 className="text-xl font-semibold text-forest-900 mb-4">
        {store.t('order_summary_title')}
      </h2>

      <div className="border-t border-sand-200 pt-4">
        <div className="flex justify-between text-lg font-semibold text-forest-900">
          <span>{store.t('subtotal')}</span>
          <span>{store.formatPrice(subtotal)}</span>
        </div>
        <p className="text-xs text-forest-600 mt-1">
          {store.optional('shipping_policy') || store.t('shipping_pending_notice')}
        </p>

        {reference && (
          <p className="text-sm text-forest-700 mt-3">
            {store.t('reference_code')}: <strong>{reference}</strong>
          </p>
        )}

        <p className="mt-4 rounded bg-sand-100 p-3 text-sm text-forest-800">
          {store.text('inventory_notice', 'inventory_notice_fallback')}
        </p>

        {store.optional('checkout_instructions') && (
          <p className="mt-3 text-sm text-forest-700 whitespace-pre-line">
            {store.optional('checkout_instructions')}
          </p>
        )}

        {store.contact.hasWhatsApp ? (
          <a
            href={enabled ? whatsappLink : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!enabled}
            onClick={(e) => {
              if (!enabled) {
                e.preventDefault();
                return;
              }
              onRequest();
            }}
            className={`btn mt-4 flex w-full items-center justify-center ${
              enabled ? 'btn-primary' : 'pointer-events-none bg-sand-200 text-forest-600'
            }`}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            {store.text('request_order_label', 'request_order_label')}
          </a>
        ) : (
          <p className="mt-4 rounded bg-amber-50 p-3 text-sm text-amber-900">
            {store.t('no_contact_channel')}
          </p>
        )}

        {store.contact.hasWhatsApp && !canSubmit && (
          <p className="mt-2 text-xs text-forest-600">{store.t('order_form_incomplete')}</p>
        )}

        <button
          onClick={onClearCart}
          className="mt-3 w-full rounded border border-sand-200 px-6 py-2 text-forest-800 transition hover:bg-sand-100"
        >
          {store.t('clear_cart')}
        </button>
      </div>
    </div>
  );
};
