import { MessageSquare } from "lucide-react";
import { useStore } from "@/hooks/use-store";

export const WhatsAppFloat = () => {
  const { contact, t } = useStore();

  // Hidden entirely when no WhatsApp number is configured — never a placeholder.
  if (!contact.hasWhatsApp) return null;

  return (
    <a
      href={contact.whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center transition-colors animate-fadeIn"
      aria-label={t("whatsapp_cta_title")}
      title={t("whatsapp_cta_title")}
    >
      <MessageSquare className="w-7 h-7" />
    </a>
  );
};
