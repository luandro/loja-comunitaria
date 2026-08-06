import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Mail, MapPin, Clock, Send } from "lucide-react";
import { useStore } from "@/hooks/use-store";

const Contact = () => {
  const { toast } = useToast();
  const store = useStore();
  const { contact } = store;
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: store.t("message_sent_title"),
      description: store.t("message_sent_description"),
    });
    setFormData({ name: "", email: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-sand-50 py-16 animate-fadeIn">
      <div className="container mx-auto">
        <h1 className="text-4xl font-marcellus text-forest-900 text-center mb-12">
          {store.t("contact_page_title")}
        </h1>

        {contact.hasWhatsApp && (
          <div className="max-w-3xl mx-auto mb-12">
            <a
              href={contact.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white py-5 px-8 rounded-lg shadow-md transition-colors"
            >
              <MessageSquare className="w-7 h-7 mr-3" />
              <div className="text-left">
                <span className="block text-lg font-semibold">{store.t("whatsapp_cta_title")}</span>
                <span className="block text-sm text-emerald-100">
                  {store.t("whatsapp_cta_subtitle")}
                </span>
              </div>
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-marcellus text-forest-900 mb-6">
                {store.t("contact_info_title")}
              </h2>
              <div className="space-y-5">
                {contact.hasWhatsApp && (
                  <a
                    href={contact.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 group"
                  >
                    <span className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <MessageSquare className="w-5 h-5 text-emerald-600" />
                    </span>
                    <div>
                      <span className="block text-sm font-semibold text-forest-900">
                        {store.t("whatsapp")}
                      </span>
                      <span className="text-emerald-600 group-hover:text-emerald-700 transition-colors">
                        {store.t("whatsapp_click_to_talk")}
                      </span>
                    </div>
                  </a>
                )}
                {contact.location && (
                  <div className="flex items-center space-x-3">
                    <span className="w-10 h-10 rounded-full bg-sand-100 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-terra-500" />
                    </span>
                    <div>
                      <span className="block text-sm font-semibold text-forest-900">
                        {store.t("address")}
                      </span>
                      <span className="text-forest-700">{contact.location}</span>
                    </div>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center space-x-3">
                    <span className="w-10 h-10 rounded-full bg-sand-100 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-terra-500" />
                    </span>
                    <div>
                      <span className="block text-sm font-semibold text-forest-900">
                        {store.t("email")}
                      </span>
                      <span className="text-forest-700">{contact.email}</span>
                    </div>
                  </div>
                )}
                {contact.businessHours && (
                  <div className="flex items-center space-x-3">
                    <span className="w-10 h-10 rounded-full bg-sand-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-terra-500" />
                    </span>
                    <div>
                      <span className="block text-sm font-semibold text-forest-900">
                        {store.t("business_hours")}
                      </span>
                      <span className="text-forest-700">{contact.businessHours}</span>
                    </div>
                  </div>
                )}
                {!contact.hasAnyChannel && (
                  <p className="text-forest-700">{store.t("no_contact_channel")}</p>
                )}
              </div>
            </div>

            {store.optional("checkout_instructions") && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-marcellus text-forest-900 mb-4">
                  {store.t("order_summary_title")}
                </h2>
                <p className="text-forest-700 whitespace-pre-line">
                  {store.optional("checkout_instructions")}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-marcellus text-forest-900 mb-6">
              {store.t("contact_form_title")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-forest-700 mb-1">
                  {store.t("field_name")}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-sand-200 rounded-md focus:outline-none focus:ring-2 focus:ring-terra-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-forest-700 mb-1">
                  {store.t("field_email")}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-sand-200 rounded-md focus:outline-none focus:ring-2 focus:ring-terra-500"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-forest-700 mb-1">
                  {store.t("field_message")}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-sand-200 rounded-md focus:outline-none focus:ring-2 focus:ring-terra-500"
                />
              </div>

              <button type="submit" className="btn btn-primary w-full flex items-center justify-center">
                <Send className="w-4 h-4 mr-2" />
                {store.t("send_message")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
