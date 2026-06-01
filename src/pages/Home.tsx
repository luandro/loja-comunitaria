import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { useSiteContent } from "@/context/SiteContentContext";

const Home = () => {
  const { featuredProducts, isLoading, error } = useProducts();
  const { content } = useSiteContent();

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section
        className="relative bg-forest-900 text-white py-24 bg-cover bg-center"
        style={
          content.hero_image_url
            ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${content.hero_image_url})` }
            : undefined
        }
      >
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-marcellus mb-6">
            {content.hero_title}
          </h1>
          <p className="text-lg md:text-xl text-sand-100 mb-8 max-w-2xl mx-auto">
            {content.hero_description}
          </p>
          <Link to="/produtos" className="btn btn-primary text-lg">
            {content.hero_button_label}
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-700" />
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
            <Link to="/produtos" className="btn btn-secondary">
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
                {content.about_title}
              </h2>
              <p className="text-forest-700 mb-6 whitespace-pre-line">
                {content.about_text}
              </p>
              <Link to="/sobre" className="btn btn-secondary">
                {content.about_button_label}
              </Link>
            </div>
            <div className="aspect-square bg-sand-200 rounded-lg overflow-hidden">
              <img
                src={content.about_image_url || "/placeholder.svg"}
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
