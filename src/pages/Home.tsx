import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useProducts } from "@/hooks/use-products";

const Home = () => {
  const { featuredProducts, isLoading, error } = useProducts();

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

          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-700"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
            </div>
          )}

          {!isLoading && !error && featuredProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-forest-700">
                Nenhum produto disponível no momento. Volte mais tarde!
              </p>
            </div>
          )}

          {!isLoading && !error && featuredProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}

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