import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

const CartLink = ({ onClick, className }: { onClick?: () => void; className?: string }) => {
  const { itemCount } = useCart();
  return (
    <Link to="/carrinho" onClick={onClick} className={`nav-link flex items-center relative ${className ?? ""}`}>
      <span className="relative inline-flex mr-1">
        <ShoppingCart className="w-5 h-5" />
        {itemCount > 0 && (
          <span
            aria-label={`${itemCount} itens no carrinho`}
            className="absolute -top-2 -right-2 bg-terra-600 text-white text-[10px] leading-none font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center"
          >
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </span>
      <span>Carrinho</span>
    </Link>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);
  const { itemCount } = useCart();

  return (
    <nav className="bg-sand-50 border-b border-sand-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-marcellus text-forest-900">
            Artesanatos Indígenas
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="nav-link">Início</Link>
            <Link to="/produtos" className="nav-link">Produtos</Link>
            <Link to="/sobre" className="nav-link">Sobre</Link>
            <Link to="/contato" className="nav-link">Contato</Link>
            <CartLink />
          </div>

          <div className="flex items-center space-x-3 md:hidden">
            <Link to="/carrinho" className="p-2 relative" aria-label="Carrinho">
              <ShoppingCart className="w-6 h-6 text-forest-800" />
              {itemCount > 0 && (
                <span
                  aria-label={`${itemCount} itens no carrinho`}
                  className="absolute -top-0.5 -right-0.5 bg-terra-600 text-white text-[10px] leading-none font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
            <button
              className="p-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              {isOpen ? <X className="h-6 w-6 text-forest-800" /> : <Menu className="h-6 w-6 text-forest-800" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 space-y-2 animate-fadeIn">
            <Link to="/" className="block nav-link" onClick={close}>Início</Link>
            <Link to="/produtos" className="block nav-link" onClick={close}>Produtos</Link>
            <Link to="/sobre" className="block nav-link" onClick={close}>Sobre</Link>
            <Link to="/contato" className="block nav-link" onClick={close}>Contato</Link>
            <CartLink onClick={close} className="block" />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
