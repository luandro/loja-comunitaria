
import { Link } from "react-router-dom";
import { MessageSquare, Mail, MapPin } from "lucide-react";
import { getWhatsAppContactLink } from "@/lib/whatsapp";

const Footer = () => {
  const whatsappLink = getWhatsAppContactLink();

  return (
    <footer className="bg-forest-800 text-sand-100 py-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-marcellus">Tribal Artesanatos</h3>
            <p className="text-sand-300 max-w-xs">
              Conectando a arte indígena brasileira com amantes de artesanato em
              todo o mundo.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-marcellus">Links Rápidos</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/" className="text-sand-300 hover:text-sand-100">
                Início
              </Link>
              <Link to="/produtos" className="text-sand-300 hover:text-sand-100">
                Produtos
              </Link>
              <Link to="/sobre" className="text-sand-300 hover:text-sand-100">
                Sobre
              </Link>
              <Link to="/contato" className="text-sand-300 hover:text-sand-100">
                Contato
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-marcellus">Contato</h4>
            <div className="space-y-3">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center group"
              >
                <span className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center mr-3 group-hover:bg-emerald-500 transition-colors">
                  <MessageSquare className="w-4 h-4 text-white" />
                </span>
                <div>
                  <span className="block text-sm font-semibold text-emerald-400">WhatsApp</span>
                  <span className="text-sand-300 group-hover:text-sand-100 transition-colors">Fale conosco agora</span>
                </div>
              </a>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-terra-400" />
                <span className="text-sand-300">São Paulo, SP</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-terra-400" />
                <span className="text-sand-300">contato@tribalartesanatos.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-forest-700 text-center text-sand-400">
          <p>© 2025 Artesanatos. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
