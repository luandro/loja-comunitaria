import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useSiteContent } from '@/context/SiteContentContext';
import { useStore } from '@/hooks/use-store';
import { CartItem, EmptyCart, OrderRequestForm, OrderSummary, PixPanel } from '@/components/cart';
import { getWhatsAppCustomLink } from '@/lib/whatsapp';
import {
  buildOrderRequestMessage,
  EMPTY_ORDER_REQUEST,
  isOrderRequestValid,
  type OrderRequestData,
} from '@/lib/order-request';
import { useToast } from '@/hooks/use-toast';

const Cart = () => {
  const { cart, total, orderId, updateQuantity, removeItem, clearCart, isEmpty, createOrder } =
    useCart();
  const { content } = useSiteContent();
  const store = useStore();
  const { toast } = useToast();

  const [form, setForm] = useState<OrderRequestData>(EMPTY_ORDER_REQUEST);
  const patchForm = (patch: Partial<OrderRequestData>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const [reference, setReference] = useState(orderId);
  useEffect(() => {
    if (!orderId) setReference(createOrder());
    else setReference(orderId);
  }, [orderId, createOrder]);

  const canSubmit = !isEmpty && isOrderRequestValid(form);
  const whatsappNumber = store.contact.whatsappNumber;

  const whatsappLink = useMemo(() => {
    const message = buildOrderRequestMessage({
      cart,
      subtotal: total,
      reference,
      data: form,
      storeName: store.storeName,
      locale: store.locale,
      currency: store.currency,
    });
    return getWhatsAppCustomLink(message, whatsappNumber);
  }, [cart, total, reference, form, store.storeName, store.locale, store.currency, whatsappNumber]);

  if (isEmpty) return <EmptyCart />;

  return (
    <div className="bg-sand-50 py-16 animate-fadeIn">
      <div className="container mx-auto">
        <h1 className="text-3xl font-marcellus text-forest-900 mb-2">{store.t('cart_title')}</h1>
        <p className="text-forest-700">{store.text('order_notice', 'order_notice_fallback')}</p>
        <p className="text-forest-700 mb-8 font-medium">
          {store.t('availability_disclaimer')}
        </p>



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}

            <OrderRequestForm
              data={form}
              onChange={patchForm}
              cep={{
                enabled: content.cep_lookup_enabled?.toString().toLowerCase() !== 'false',
                privacyNotice: content.cep_lookup_privacy_notice || undefined,
                loading: content.cep_lookup_loading_message || undefined,
                success: content.cep_lookup_success_message || undefined,
                partial: content.cep_lookup_partial_message || undefined,
                error: content.cep_lookup_error_message || undefined,
              }}
            />
          </div>

          <OrderSummary
            subtotal={total}
            reference={reference}
            canSubmit={canSubmit}
            whatsappLink={whatsappLink}
            onRequest={() =>
              toast({
                title: store.t('order_ready_title'),
                description: store.t('order_ready_description'),
              })
            }
            onClearCart={clearCart}
          />
        </div>

        {store.pix.immediate && (
          <div className="mt-8 max-w-xl">
            <PixPanel subtotal={total} reference={reference} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
