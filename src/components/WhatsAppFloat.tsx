import { MessageSquare } from "lucide-react";
import { getWhatsAppContactLink } from "@/lib/whatsapp";
import { useSiteContent } from "@/context/SiteContentContext";
import { resolveWhatsApp } from "@/lib/site-content";

export const WhatsAppFloat = () => {
  const { content } = useSiteContent();
  const link = getWhatsAppContactLink(resolveWhatsApp(content));

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center transition-colors animate-fadeIn"
      aria-label="Fale conosco no WhatsApp"
      title="Fale conosco no WhatsApp"
    >
      <MessageSquare className="w-7 h-7" />
    </a>
  );
};
