
import ProductCard from "../components/ProductCard";

const products = [
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
  },
  {
    id: 4,
    name: "Cocar Kayapó",
    price: 299.90,
    image: "/placeholder.svg",
    description: "Cocar tradicional feito com penas naturais e técnicas ancestrais."
  },
  {
    id: 5,
    name: "Pulseira Pataxó",
    price: 49.90,
    image: "/placeholder.svg",
    description: "Pulseira artesanal com miçangas e motivos tradicionais."
  },
  {
    id: 6,
    name: "Arco e Flecha",
    price: 179.90,
    image: "/placeholder.svg",
    description: "Conjunto decorativo de arco e flecha feito artesanalmente."
  }
];

const Products = () => {
  return (
    <div className="bg-sand-50 py-16 animate-fadeIn">
      <div className="container mx-auto">
        <h1 className="text-4xl font-marcellus text-forest-900 text-center mb-12">
          Nossos Produtos
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
