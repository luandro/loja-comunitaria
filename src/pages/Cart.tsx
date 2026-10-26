import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useSiteContent } from '@/context/SiteContentContext';
import { useStore } from '@/hooks/use-store';
import { useProducts } from '@/hooks/use-products';
import { CartItem, EmptyCart, PixPanel, DeliveryChoice, AddressSection } from '@/components/cart';
import { getWhatsAppCustomLink } from '@/lib/whatsapp';
import {
  buildCheckoutMessage,
  cartBlockingIssue,
  EMPTY_CHECKOUT,
  firstMissing,
  isCheckoutReady,
  loadCheckout,
  pixDecision,
  saveCheckout,
  type CheckoutData,
  type CheckoutMissing,
} from '@/lib/checkout';
import { getInventoryStatus } from '@/lib/inventory';
import { Seo } from '@/components/Seo';
import { pageTitle } from '@/lib/seo';

const inputClass =
  'w-full rounded border border-sand-200 bg-white px-3 py-3 text-base text-forest-900 outline-none focus:border-forest-600';

/**
 * One-page progressive checkout: cart → delivery → address → name → Pix →
 * WhatsApp. No wizard, no review screen, no accounts. The whole state (cart,
 * checkout data, reference code) is persisted in localStorage, so the
 * bank-app round trip never loses anything.
 */
const Cart = () => {
  const { cart, total, orderId, updateQuantity, removeItem, clearCart, isEmpty, createOrder } =
    useCart();
  const { content } = useSiteContent();
  const store = useStore();
  const { products } = useProducts();

  const [form, setForm] = useState<CheckoutData>(() => loadCheckout() ?? EMPTY_CHECKOUT);
  const patchForm = (patch: Partial<CheckoutData>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  // Persist every change — the customer may switch to the bank app at any time.
  useEffect(() => saveCheckout(form), [form]);

  const [missing, setMissing] = useState<CheckoutMissing | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // One stable reference per cart, persisted by CartContext. Never regenerated
  // on refresh, PWA resume or app switching.
  const [reference, setReference] = useState(orderId);
  useEffect(() => {
    if (!orderId) setReference(createOrder());
    else setReference(orderId);
  }, [orderId, createOrder]);

  const ready = isCheckoutReady(form);

  // Inventory guard: never take payment for an obviously invalid cart.
  const blockedName = cartBlockingIssue(cart, (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return false;
    return getInventoryStatus({
      inventoryType: product.inventoryType,
      stockQuantity: product.stockQuantity,
      productionTime: product.productionTime,
    }).isSoldOut;
  });

  const pix = pixDecision({
    pixAutomatic: store.pixAutomatic,
    pixAvailable: store.pix.available,
    ready: ready && !blockedName,
    amount: total,
    delivery: form.delivery,
    freightSeparate: store.freightSeparate,
  });

  const whatsappLink = useMemo(() => {
    const message = buildCheckoutMessage({
      cart,
      total,
      reference,
      data: form,
      storeName: store.storeName,
      paid: pix.show,
      freightNote: pix.freightNote,
      locale: store.locale,
      currency: store.currency,
    });
    return getWhatsAppCustomLink(message, store.contact.whatsappNumber);
  }, [cart, total, reference, form, pix.show, pix.freightNote, store]);

  const canSend = ready && !blockedName && store.contact.hasWhatsApp && !isEmpty;

  const handleSend = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (blockedName || !store.contact.hasWhatsApp) {
      e.preventDefault();
      return;
    }
    const m = firstMissing(form);
    if (m) {
      e.preventDefault();
      setMissing(m);
      if (m === 'name') nameRef.current?.focus();
      else document.getElementById(m === 'number' ? 'ck-number' : 'ck-city')?.focus();
      return;
    }
    setMissing(null);
  };

  const missingMessage =
    missing === 'name'
      ? store.t('need_name')
      : missing === 'number'
        ? store.t('need_number')
        : missing === 'city'
          ? store.t('need_city')
          : '';

  const cartSeo = (
    <Seo title={pageTitle([store.t('cart_title'), store.storeName])} path="/carrinho" noindex />
  );

  if (isEmpty)
    return (
      <>
        {cartSeo}
        <EmptyCart />
      </>
    );

  return (
    <div className="bg-sand-50 py-6 md:py-10">
      {cartSeo}
      <div className="container mx-auto max-w-xl">
        <h1 className="text-2xl md:text-3xl font-marcellus text-forest-900 mb-4">
          {store.t('your_order')}
        </h1>

        <div className="space-y-3">
          {cart.map((item) => (
            <CartItem key={item.id} item={item} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
          ))}
        </div>

        <p className="mt-4 flex items-baseline justify-between text-lg font-semibold text-forest-900">
          <span>{store.t('total_products')}</span>
          <span>{store.formatPrice(total)}</span>
        </p>
        <p className="mt-1 text-xs text-forest-600">
          {store.text('inventory_notice', 'inventory_notice_fallback')}
        </p>

        {blockedName && (
          <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            {store.t('order_blocked_soldout').replace('{name}', blockedName)}
          </p>
        )}

        <DeliveryChoice
          value={form.delivery}
          onChange={(delivery) => patchForm({ delivery })}
          pickupAvailable={store.pickupAvailable}
        />

        {form.delivery === 'entrega' && (
          <AddressSection
            data={form}
            onChange={patchForm}
            cepEnabled={content.cep_lookup_enabled?.toString().toLowerCase() !== 'false'}
          />
        )}

        <section aria-label={store.t('your_name')} className="mt-6">
          <label htmlFor="ck-name" className="block text-sm font-medium text-forest-800 mb-1">
            {store.t('your_name')} *
          </label>
          <input
            id="ck-name"
            ref={nameRef}
            className={inputClass}
            value={form.name}
            maxLength={100}
            autoComplete="name"
            placeholder={store.t('name_placeholder')}
            onChange={(e) => patchForm({ name: e.target.value })}
          />
        </section>

        {missingMessage && (
          <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            {missingMessage}
          </p>
        )}

        {pix.show && (
          <PixPanel
            amount={total}
            reference={reference}
            freightNote={pix.freightNote}
            whatsappLink={whatsappLink}
            onSend={handleSend}
            canSend={canSend}
          />
        )}

        {/* Sticky on mobile so the next action is always visible; static on desktop. */}
        {!pix.show && (
          <div className="sticky bottom-0 z-10 -mx-4 mt-6 bg-sand-50/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:static md:mx-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
            {store.contact.hasWhatsApp ? (
              <a
                href={canSend ? whatsappLink : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!canSend}
                onClick={handleSend}
                className={`btn flex w-full items-center justify-center text-base ${
                  canSend ? 'btn-primary' : 'pointer-events-none bg-sand-200 text-forest-600'
                }`}
              >
                <MessageSquare className="mr-2 h-5 w-5" aria-hidden />
                {store.t('send_order_whatsapp')}
              </a>
            ) : (
              <p className="rounded bg-amber-50 p-3 text-sm text-amber-900">
                {store.t('no_contact_channel')}
              </p>
            )}
            {store.contact.hasWhatsApp && (
              <p className="mt-2 text-center text-sm text-forest-700">
                {store.t('payment_arranged_whatsapp')}
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={clearCart}
          className="mt-6 w-full rounded border border-sand-200 px-6 py-2 text-sm text-forest-800 transition hover:bg-sand-100"
        >
          {store.t('clear_cart')}
        </button>
      </div>
    </div>
  );
};

export default Cart;
