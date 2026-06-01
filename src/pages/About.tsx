import { useSiteContent } from "@/context/SiteContentContext";

const About = () => {
  const { content } = useSiteContent();

  return (
    <div className="bg-sand-50 py-16 animate-fadeIn">
      <div className="container mx-auto">
        <h1 className="text-4xl font-marcellus text-forest-900 text-center mb-12">
          {content.about_title || "Sobre Nós"}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <p className="text-forest-700 whitespace-pre-line">
              {content.about_text}
            </p>
          </div>
          <div className="aspect-square bg-sand-200 rounded-lg overflow-hidden">
            <img
              src={content.about_image_url || "/placeholder.svg"}
              alt="Artesão indígena trabalhando"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-marcellus text-forest-900 mb-4">
              Nossa Missão
            </h3>
            <p className="text-forest-700">
              {content.mission_text ||
                "Promover e preservar a arte indígena brasileira, garantindo que as tradições culturais continuem vivas e valorizadas."}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-marcellus text-forest-900 mb-4">
              Nossos Valores
            </h3>
            <p className="text-forest-700">
              {content.values_text ||
                "Autenticidade, sustentabilidade e respeito às tradições são os pilares que guiam nosso trabalho com as comunidades indígenas."}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-marcellus text-forest-900 mb-4">
              Nosso Compromisso
            </h3>
            <p className="text-forest-700">
              {content.commitment_text ||
                "Garantir que cada peça vendida beneficie diretamente os artesãos e suas comunidades, promovendo o comércio justo."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
