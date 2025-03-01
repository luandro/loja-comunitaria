
const About = () => {
  return (
    <div className="bg-sand-50 py-16 animate-fadeIn">
      <div className="container mx-auto">
        <h1 className="text-4xl font-marcellus text-forest-900 text-center mb-12">
          Sobre Nós
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <p className="text-forest-700">
              A l Artesanatos nasceu do profundo respeito e admiração pela rica
              cultura dos povos indígenas brasileiros. Nossa missão é criar uma
              ponte entre os artesãos indígenas e pessoas que valorizam a arte
              autêntica e sustentável.
            </p>
            <p className="text-forest-700">
              Trabalhamos diretamente com comunidades indígenas, garantindo que
              cada peça seja produzida de forma justa e ética, preservando as
              técnicas tradicionais passadas de geração em geração.
            </p>
          </div>
          <div className="aspect-square bg-sand-200 rounded-lg overflow-hidden">
            <img
              src="/placeholder.svg"
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
              Promover e preservar a arte indígena brasileira, garantindo que as
              tradições culturais continuem vivas e valorizadas.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-marcellus text-forest-900 mb-4">
              Nossos Valores
            </h3>
            <p className="text-forest-700">
              Autenticidade, sustentabilidade e respeito às tradições são os
              pilares que guiam nosso trabalho com as comunidades indígenas.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-marcellus text-forest-900 mb-4">
              Nosso Compromisso
            </h3>
            <p className="text-forest-700">
              Garantir que cada peça vendida beneficie diretamente os artesãos e
              suas comunidades, promovendo o comércio justo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
