import { Link } from "react-router-dom";
import { MessageSquare, Mail, MapPin, Instagram, Facebook } from "lucide-react";
import { useStore } from "@/hooks/use-store";

const Footer = () => {
  const store = useStore();
  const { contact } = store;
  const name = store.optional("footer_store_name") || store.storeName;
  const tagline = store.optional("footer_tagline") || store.tagline;
  const logoUrl = store.optional("logo_url");
  const copyright =
    store.optional("copyright_text") ||
    `© ${new Date().getFullYear()} ${name}. ${store.t("rights_reserved")}`;

  const links = [
    { to: "/", label: store.text("home_label", "nav_home") },
    { to: "/produtos", label: store.text("products_label", "nav_products") },
    { to: "/sobre", label: store.text("about_label", "nav_about") },
    { to: "/contato", label: store.text("contact_label", "nav_contact") },
  ];

  return (
    <footer className="bg-forest-800 text-sand-100 py-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            {logoUrl ? <img src={logoUrl} alt={name} className="h-10 w-auto" /> : null}
            <h3 className="text-xl font-marcellus">{name}</h3>
            {tagline && <p className="text-sand-300 max-w-xs">{tagline}</p>}
            {(contact.instagramUrl || contact.facebookUrl) && (
              <div className="flex items-center gap-3 pt-2">
                {contact.instagramUrl && (
                  <a
                    href={contact.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="text-sand-300 hover:text-sand-100"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {contact.facebookUrl && (
                  <a
                    href={contact.facebookUrl}
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
            <h4 className="text-lg font-marcellus">{store.t("quick_links")}</h4>
            <div className="flex flex-col space-y-2">
              {links.map((link) => (
                <Link key={link.to} to={link.to} className="text-sand-300 hover:text-sand-100">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-marcellus">
              {store.text("contact_label", "nav_contact")}
            </h4>
            <div className="space-y-3">
              {contact.hasWhatsApp && (
                <a
                  href={contact.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center group"
                >
                  <span className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center mr-3 group-hover:bg-emerald-500 transition-colors">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </span>
                  <div>
                    <span className="block text-sm font-semibold text-emerald-400">
                      {store.t("whatsapp")}
                    </span>
                    <span className="text-sand-300 group-hover:text-sand-100 transition-colors">
                      {store.t("whatsapp_click_to_talk")}
                    </span>
                  </div>
                </a>
              )}
              {contact.location && (
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-3 text-terra-400" />
                  <span className="text-sand-300">{contact.location}</span>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-terra-400" />
                  <span className="text-sand-300">{contact.email}</span>
                </div>
              )}
              {!contact.hasAnyChannel && (
                <p className="text-sand-400 text-sm">{store.t("no_contact_channel")}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-forest-700 text-center text-sand-400">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
