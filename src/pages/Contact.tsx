
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Mail, MapPin, Clock, Send } from "lucide-react";
import { getWhatsAppContactLink } from "@/lib/whatsapp";
import { useSiteContent } from "@/context/SiteContentContext";
import { resolveWhatsApp } from "@/lib/site-content";

const Contact = () => {
  const { toast } = useToast();
  const { content } = useSiteContent();
  const whatsappLink = getWhatsAppContactLink(resolveWhatsApp(content));
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Mensagem enviada!",
      description: "Entraremos em contato em breve.",
    });
    setFormData({ name: "", email: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-sand-50 py-16 animate-fadeIn">
      <div className="container mx-auto">
        <h1 className="text-4xl font-marcellus text-forest-900 text-center mb-12">
          Entre em Contato
        </h1>

        {/* WhatsApp CTA Banner */}
        <div className="max-w-3xl mx-auto mb-12">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white py-5 px-8 rounded-lg shadow-md transition-colors"
          >
            <MessageSquare className="w-7 h-7 mr-3" />
            <div className="text-left">
              <span className="block text-lg font-semibold">Fale conosco pelo WhatsApp</span>
              <span className="block text-sm text-emerald-100">Resposta rápida e personalizada</span>
            </div>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-marcellus text-forest-900 mb-6">
                Informações de Contato
              </h2>
              <div className="space-y-5">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 group"
                >
                  <span className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                  </span>
                  <div>
                    <span className="block text-sm font-semibold text-forest-900">WhatsApp</span>
                    <span className="text-emerald-600 group-hover:text-emerald-700 transition-colors">Clique para conversar</span>
                  </div>
                </a>
                <div className="flex items-center space-x-3">
                  <span className="w-10 h-10 rounded-full bg-sand-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-terra-500" />
                  </span>
                  <div>
                    <span className="block text-sm font-semibold text-forest-900">Endereço</span>
                    <span className="text-forest-700">{content.location}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-10 h-10 rounded-full bg-sand-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-terra-500" />
                  </span>
                  <div>
                    <span className="block text-sm font-semibold text-forest-900">E-mail</span>
                    <span className="text-forest-700">{content.email}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-10 h-10 rounded-full bg-sand-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-terra-500" />
                  </span>
                  <div>
                    <span className="block text-sm font-semibold text-forest-900">Horário de Atendimento</span>
                    <span className="text-forest-700">{content.business_hours}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-marcellus text-forest-900 mb-4">
                Preferência de Atendimento
              </h2>
              <p className="text-forest-700">
                Para um atendimento mais ágil e personalizado, recomendamos o contato via WhatsApp.
                Respondemos em poucos minutos durante o horário comercial.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-marcellus text-forest-900 mb-6">
              Envie sua Mensagem
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-forest-700 mb-1">
                  Nome
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
                  E-mail
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
                  Mensagem
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
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
