import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useStore } from "@/hooks/use-store";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount } = useCart();
  const store = useStore();
  const location = useLocation();

  // Close the mobile menu whenever the route changes.
  useEffect(() => setIsOpen(false), [location.pathname]);

  const links = [
    { to: "/", label: store.text("home_label", "nav_home") },
    { to: "/produtos", label: store.text("products_label", "nav_products") },
    { to: "/sobre", label: store.text("about_label", "nav_about") },
    { to: "/contato", label: store.text("contact_label", "nav_contact") },
  ];
  const cartLabel = store.text("cart_label", "nav_cart");
  const logoUrl = store.optional("logo_url");
  const countText = itemCount > 99 ? "99+" : String(itemCount);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? "bg-sand-100 text-forest-900" : "text-forest-800 hover:text-terra-600"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200 bg-sand-50/95 backdrop-blur supports-[backdrop-filter]:bg-sand-50/85">
      <nav className="container" aria-label={store.t("nav_menu")}>
        <div className="flex h-14 items-center justify-between gap-3">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 font-marcellus text-xl text-forest-900"
          >
            {logoUrl && <img src={logoUrl} alt="" className="h-8 w-auto shrink-0" />}
            <span className="truncate">{store.storeName}</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === "/"} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Link
              to="/carrinho"
              className="relative inline-flex h-11 items-center gap-2 rounded-full bg-terra-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-terra-700"
              aria-label={itemCount > 0 ? `${cartLabel}: ${itemCount}` : cartLabel}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              <span className="hidden sm:inline">{cartLabel}</span>
              {itemCount > 0 && (
                <span
                  aria-hidden="true"
                  className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-terra-700"
                >
                  {countText}
                </span>
              )}
            </Link>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-forest-800 md:hidden"
              onClick={() => setIsOpen((v) => !v)}
              aria-label={store.t("nav_menu")}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div id="mobile-menu" className="flex flex-col gap-1 border-t border-sand-200 py-2 md:hidden">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={(s) => `${linkClass(s)} flex min-h-[44px] items-center text-base`}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
