import { Link } from "react-router-dom";
import { MessageSquare, Mail, MapPin, Instagram, Facebook } from "lucide-react";
import { getWhatsAppContactLink } from "@/lib/whatsapp";
import { useSiteContent } from "@/context/SiteContentContext";
import { resolveWhatsApp } from "@/lib/site-content";

const Footer = () => {
  const { content } = useSiteContent();
  const whatsappLink = getWhatsAppContactLink(resolveWhatsApp(content));

  return (
    <footer className="bg-forest-800 text-sand-100 py-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            {content.logo_url ? (
              <img src={content.logo_url} alt={content.site_name} className="h-10 w-auto" />
            ) : null}
            <h3 className="text-xl font-marcellus">{content.site_name}</h3>
            <p className="text-sand-300 max-w-xs">{content.site_tagline}</p>
            {(content.instagram_url || content.facebook_url) && (
              <div className="flex items-center gap-3 pt-2">
                {content.instagram_url && (
                  <a
                    href={content.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="text-sand-300 hover:text-sand-100"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {content.facebook_url && (
                  <a
                    href={content.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="text-sand-300 hover:text-sand-100"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-marcellus">Links Rápidos</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/" className="text-sand-300 hover:text-sand-100">Início</Link>
              <Link to="/produtos" className="text-sand-300 hover:text-sand-100">Produtos</Link>
              <Link to="/sobre" className="text-sand-300 hover:text-sand-100">Sobre</Link>
              <Link to="/contato" className="text-sand-300 hover:text-sand-100">Contato</Link>
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
              {content.location && (
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-3 text-terra-400" />
                  <span className="text-sand-300">{content.location}</span>
                </div>
              )}
              {content.email && (
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-terra-400" />
                  <span className="text-sand-300">{content.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-forest-700 text-center text-sand-400">
          <p>© {new Date().getFullYear()} {content.site_name}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
