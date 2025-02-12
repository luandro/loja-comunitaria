
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";

const featuredProducts = [
  {
    id: 1,
    name: "Colar Guarani",
    price: 89.90,
    image: "/placeholder.svg",
    description: "Colar artesanal feito com sementes naturais da floresta amazônica."
  },
  {
    id: 2,
    name: "Cesto Xavante",
    price: 149.90,
    image: "/placeholder.svg",
    description: "Cesto tradicional feito com fibras naturais e pinturas indígenas."
  },
  {
    id: 3,
    name: "Cerâmica Marajoara",
    price: 199.90,
    image: "/placeholder.svg",
    description: "Vaso decorativo com padrões tradicionais da ilha de Marajó."
  }
];

const Home = () => {
  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative bg-forest-900 text-white py-24">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-marcellus mb-6">
            Arte Indígena Autêntica
          </h1>
          <p className="text-lg md:text-xl text-sand-100 mb-8 max-w-2xl mx-auto">
            Descubra a riqueza do artesanato indígena brasileiro: peças únicas que
            contam histórias milenares.
          </p>
          <Link
            to="/produtos"
            className="btn btn-primary text-lg"
          >
            Explorar Produtos
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-sand-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-marcellus text-forest-900 text-center mb-12">
            Produtos em Destaque
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/produtos"
              className="btn btn-secondary"
            >
              Ver Todos os Produtos
            </Link>
          </div>
        </div>
      </section>

      {/* About Section Preview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-marcellus text-forest-900 mb-6">
                Nossa História
              </h2>
              <p className="text-forest-700 mb-6">
                A Tribal Artesanatos nasceu do desejo de valorizar e compartilhar a
                rica tradição artística dos povos indígenas brasileiros. Cada peça
                em nossa loja carrega consigo séculos de história e cultura.
              </p>
              <Link
                to="/sobre"
                className="btn btn-secondary"
              >
                Conheça Nossa História
              </Link>
            </div>
            <div className="aspect-square bg-sand-200 rounded-lg overflow-hidden">
              <img
                src="/placeholder.svg"
                alt="Artesão indígena"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
