import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useStore } from "@/hooks/use-store";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);
  const { itemCount } = useCart();
  const store = useStore();

  const links = [
    { to: "/", label: store.text("home_label", "nav_home") },
    { to: "/produtos", label: store.text("products_label", "nav_products") },
    { to: "/sobre", label: store.text("about_label", "nav_about") },
    { to: "/contato", label: store.text("contact_label", "nav_contact") },
  ];
  const cartLabel = store.text("cart_label", "nav_cart");
  const logoUrl = store.optional("logo_url");

  const Badge = ({ className }: { className: string }) =>
    itemCount > 0 ? (
      <span
        aria-label={`${itemCount} ${cartLabel}`}
        className={`bg-terra-600 text-white text-[10px] leading-none font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center ${className}`}
      >
        {itemCount > 99 ? "99+" : itemCount}
      </span>
    ) : null;

  return (
    <nav className="bg-sand-50 border-b border-sand-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-2xl font-marcellus text-forest-900">
            {logoUrl && <img src={logoUrl} alt={store.storeName} className="h-8 w-auto" />}
            <span>{store.storeName}</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className="nav-link">
                {link.label}
              </Link>
            ))}
            <Link to="/carrinho" className="nav-link flex items-center relative">
              <span className="relative inline-flex mr-1">
                <ShoppingCart className="w-5 h-5" />
                <Badge className="absolute -top-2 -right-2" />
              </span>
              <span>{cartLabel}</span>
            </Link>
          </div>

          <div className="flex items-center space-x-3 md:hidden">
            <Link to="/carrinho" className="p-2 relative" aria-label={cartLabel}>
              <ShoppingCart className="w-6 h-6 text-forest-800" />
              <Badge className="absolute -top-0.5 -right-0.5" />
            </Link>
            <button
              className="p-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={store.t("nav_menu")}
            >
              {isOpen ? <X className="h-6 w-6 text-forest-800" /> : <Menu className="h-6 w-6 text-forest-800" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 space-y-2 animate-fadeIn">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className="block nav-link" onClick={close}>
                {link.label}
              </Link>
            ))}
            <Link to="/carrinho" className="block nav-link" onClick={close}>
              {cartLabel}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
