import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { useStore } from "@/hooks/use-store";
import { StoreImage } from "@/components/StoreImage";
import ProductGridSkeleton from "@/components/ProductGridSkeleton";
import { Seo } from "@/components/Seo";
import { clampDescription, pageTitle } from "@/lib/seo";

const Home = () => {
  const { featuredProducts, isLoading, error, refreshProducts } = useProducts();
  const store = useStore();
  const heroImage = store.optional("hero_image_url");
  const aboutImage = store.optional("about_image_url");
  const aboutText = store.optional("about_text");

  return (
    <div className="animate-fadeIn">
      <Seo
        title={pageTitle([store.storeName, store.text("hero_title", "hero_title_fallback")])}
        description={clampDescription(store.text("hero_description", "hero_description_fallback"))}
        image={heroImage || undefined}
        path="/"
      />
      {/* Hero Section */}
      <section
        className="relative bg-forest-900 text-white py-24 bg-cover bg-center"
        style={
          heroImage
            ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${heroImage})` }
            : undefined
        }
      >
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-marcellus mb-6">
            {store.text("hero_title", "hero_title_fallback")}
          </h1>
          <p className="text-lg md:text-xl text-sand-100 mb-8 max-w-2xl mx-auto">
            {store.text("hero_description", "hero_description_fallback")}
          </p>
          <Link to="/produtos" className="btn btn-primary text-lg">
            {store.text("hero_button_label", "hero_button_fallback")}
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-sand-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-marcellus text-forest-900 text-center mb-12">
            {store.text("featured_products_title", "featured_products_title")}
          </h2>

          {isLoading && featuredProducts.length === 0 && <ProductGridSkeleton count={3} />}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-700 mb-4">{error}</p>
              <button type="button" className="btn btn-secondary" onClick={() => refreshProducts()}>
                {store.t("catalog_retry")}
              </button>
            </div>
          )}

          {!isLoading && !error && featuredProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-forest-700">
                {store.text("empty_catalog_message", "empty_catalog_message")}
              </p>
            </div>
          )}

          {!error && featuredProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}


          <div className="text-center mt-12">
            <Link to="/produtos" className="btn btn-secondary">
              {store.text("all_products_button_label", "all_products_button_label")}
            </Link>
          </div>
        </div>
      </section>

      {/* About Section Preview */}
      {aboutText && (
        <section className="py-16 bg-white">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-marcellus text-forest-900 mb-6">
                  {store.text("about_title", "about_title_fallback")}
                </h2>
                <p className="text-forest-700 mb-6 whitespace-pre-line">{aboutText}</p>
                <Link to="/sobre" className="btn btn-secondary">
                  {store.text("about_button_label", "about_button_fallback")}
                </Link>
              </div>
              {aboutImage && (
                <div className="aspect-square bg-sand-200 rounded-lg overflow-hidden">
                  <StoreImage
                    src={aboutImage}
                    alt={store.storeName}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
