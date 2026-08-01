import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useSiteContent } from '@/context/SiteContentContext';
import { CartItem, EmptyCart, OrderRequestForm, OrderSummary } from '@/components/cart';
import { getWhatsAppCustomLink } from '@/lib/whatsapp';
import { resolveWhatsApp } from '@/lib/site-content';
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
  const { number: whatsappNumber } = resolveWhatsApp(content);

  const whatsappLink = useMemo(() => {
    const message = buildOrderRequestMessage({
      cart,
      subtotal: total,
      reference,
      data: form,
      storeName: content.site_name,
    });
    return getWhatsAppCustomLink(message, whatsappNumber);
  }, [cart, total, reference, form, content.site_name, whatsappNumber]);

  if (isEmpty) return <EmptyCart />;

  return (
    <div className="bg-sand-50 py-16 animate-fadeIn">
      <div className="container mx-auto">
        <h1 className="text-3xl font-marcellus text-forest-900 mb-2">Seu Carrinho</h1>
        <p className="text-forest-700 mb-8">
          Monte sua solicitação — a loja confirma disponibilidade, prazo e frete pelo WhatsApp.
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

            <OrderRequestForm data={form} onChange={patchForm} />
          </div>

          <OrderSummary
            subtotal={total}
            reference={reference}
            canSubmit={canSubmit}
            whatsappLink={whatsappLink}
            onRequest={() =>
              toast({
                title: 'Solicitação pronta para envio',
                description:
                  'Envie a mensagem no WhatsApp. Seu carrinho continua salvo até a loja confirmar.',
              })
            }
            onClearCart={clearCart}
          />
        </div>
      </div>
    </div>
  );
};

export default Cart;
