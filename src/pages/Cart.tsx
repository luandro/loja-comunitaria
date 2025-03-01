
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/use-cart";
import { usePixPayment } from "@/hooks/use-pix-payment";
import { CartItem, EmptyCart, OrderSummary, PixPayment } from "@/components/cart";
import { generateWhatsAppLink } from "@/lib/whatsapp";

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
    createOrder
  } = useCart();

  const {
    isLoading,
    pixQrCode,
    pixCopyCode,
    checkoutComplete,
    isCopied,
    isLocallyGenerated,
    generatePixPaymentInfo,
    copyToClipboard,
    resetPayment
  } = usePixPayment({ amount: total });

  const [whatsappLink, setWhatsappLink] = useState("");

  console.log("[Cart] Rendering cart component, isEmpty:", isEmpty, "checkoutComplete:", checkoutComplete);

  // Generate WhatsApp link when checkout is complete
  useEffect(() => {
    if (checkoutComplete) {
      const currentOrderId = orderId || createOrder();
      const link = generateWhatsAppLink(cart, total, currentOrderId);
      console.log("[Cart] Generated WhatsApp link for order:", currentOrderId);
      setWhatsappLink(link);
    }
  }, [checkoutComplete, cart, total, orderId, createOrder]);

  const handleCheckout = () => {
    console.log("[Cart] Initiating checkout process");
    // Create order ID when starting checkout
    createOrder();
    generatePixPaymentInfo();
  };

  const handleNewPurchase = () => {
    console.log("[Cart] Starting new purchase");
    resetPayment();
    clearCart();
    navigate("/produtos");
  };

  // Display empty cart message if cart is empty and checkout is not complete
  if (isEmpty && !checkoutComplete) {
    console.log("[Cart] Showing empty cart view");
    return <EmptyCart />;
  }

  // Display payment screen if checkout is complete
  if (checkoutComplete) {
    console.log("[Cart] Showing payment screen, locally generated:", isLocallyGenerated);
    return (
      <PixPayment
        pixQrCode={pixQrCode}
        pixCopyCode={pixCopyCode}
        isCopied={isCopied}
        isLocallyGenerated={isLocallyGenerated}
        total={total}
        cart={cart}
        orderId={orderId}
        whatsappLink={whatsappLink}
        onCopyToClipboard={copyToClipboard}
        onNewPurchase={handleNewPurchase}
      />
    );
  }

  // Display cart items and order summary
  console.log("[Cart] Showing cart items, count:", cart.length);
  return (
    <div className="bg-sand-50 py-16 animate-fadeIn">
      <div className="container mx-auto">
        <h1 className="text-3xl font-marcellus text-forest-900 mb-8">
          Seu Carrinho
        </h1>

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

          <OrderSummary
            total={total}
            onCheckout={handleCheckout}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Cart;
