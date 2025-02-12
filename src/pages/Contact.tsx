
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically send the form data to your backend
    toast({
      title: "Mensagem enviada!",
      description: "Entraremos em contato em breve.",
    });
    
    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-sand-50 py-16 animate-fadeIn">
      <div className="container mx-auto">
        <h1 className="text-4xl font-marcellus text-forest-900 text-center mb-12">
          Entre em Contato
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-marcellus text-forest-900 mb-6">
                Informações de Contato
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-terra-500" />
                  <span className="text-forest-700">São Paulo, SP</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-terra-500" />
                  <span className="text-forest-700">(11) 9999-9999</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-terra-500" />
                  <span className="text-forest-700">contato@tribalartesanatos.com</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-marcellus text-forest-900 mb-4">
                Horário de Atendimento
              </h2>
              <p className="text-forest-700">
                Segunda a Sexta: 9h às 18h<br />
                Sábado: 9h às 13h
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

              <button
                type="submit"
                className="btn btn-primary w-full"
              >
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
