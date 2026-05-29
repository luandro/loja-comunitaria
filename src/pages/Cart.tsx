import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/use-cart';
import { usePixPayment } from '@/hooks/use-pix-payment';
import { CartItem, EmptyCart, OrderSummary, PixPayment } from '@/components/cart';
import { generateWhatsAppLink } from '@/lib/whatsapp';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cart,
    total,
    orderId,
    updateQuantity,
    removeItem,
    clearCart,
    isEmpty,
    createOrder,
  } = useCart();

  const {
    isLoading,
    pixQrCode,
    pixCopyCode,
    checkoutComplete,
    isCopied,
    generatePixPaymentInfo,
    copyToClipboard,
    resetPayment,
  } = usePixPayment({ amount: total });

  const [whatsappLink, setWhatsappLink] = useState('');

  useEffect(() => {
    if (checkoutComplete && orderId) {
      setWhatsappLink(generateWhatsAppLink(cart, total, orderId));
    }
  }, [checkoutComplete, cart, total, orderId]);

  const handleCheckout = () => {
    createOrder();
    generatePixPaymentInfo();
  };

  const handleNewPurchase = () => {
    resetPayment();
    clearCart();
    navigate('/produtos');
  };

  if (isEmpty && !checkoutComplete) {
    return <EmptyCart />;
  }

  if (checkoutComplete) {
    return (
      <PixPayment
        pixQrCode={pixQrCode}
        pixCopyCode={pixCopyCode}
        isCopied={isCopied}
        total={total}
        cart={cart}
        orderId={orderId}
        whatsappLink={whatsappLink}
        onCopyToClipboard={copyToClipboard}
        onNewPurchase={handleNewPurchase}
      />
    );
  }

  return (
    <div className="bg-sand-50 py-16 animate-fadeIn">
      <div className="container mx-auto">
        <h1 className="text-3xl font-marcellus text-forest-900 mb-8">Seu Carrinho</h1>

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
          </div>

          <OrderSummary total={total} onCheckout={handleCheckout} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Cart;
