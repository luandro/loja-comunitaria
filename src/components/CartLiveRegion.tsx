import { useCart } from '@/hooks/use-cart';
import { useStore } from '@/hooks/use-store';

/** Politely announces cart changes to screen readers. */
export const CartLiveRegion = () => {
  const { announcement } = useCart();
  const store = useStore();

  return (
    <div
      className="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={store.t('cart_region_label')}
    >
      {announcement}
    </div>
  );
};

export default CartLiveRegion;
