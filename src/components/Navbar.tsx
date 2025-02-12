
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-sand-50 border-b border-sand-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-marcellus text-forest-900">
            Tribal Artesanatos
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="nav-link">
              Início
            </Link>
            <Link to="/produtos" className="nav-link">
              Produtos
            </Link>
            <Link to="/sobre" className="nav-link">
              Sobre
            </Link>
            <Link to="/contato" className="nav-link">
              Contato
            </Link>
            <Link to="/carrinho" className="nav-link flex items-center">
              <ShoppingCart className="w-5 h-5 mr-1" />
              <span>Carrinho</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-forest-800" />
            ) : (
              <Menu className="h-6 w-6 text-forest-800" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2 animate-fadeIn">
            <Link
              to="/"
              className="block nav-link"
              onClick={() => setIsOpen(false)}
            >
              Início
            </Link>
            <Link
              to="/produtos"
              className="block nav-link"
              onClick={() => setIsOpen(false)}
            >
              Produtos
            </Link>
            <Link
              to="/sobre"
              className="block nav-link"
              onClick={() => setIsOpen(false)}
            >
              Sobre
            </Link>
            <Link
              to="/contato"
              className="block nav-link"
              onClick={() => setIsOpen(false)}
            >
              Contato
            </Link>
            <Link
              to="/carrinho"
              className="block nav-link flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingCart className="w-5 h-5 mr-1" />
              <span>Carrinho</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
