
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const products = [
  {
    id: 1,
    name: "Colar Guarani",
    price: 89.90,
    image: "/placeholder.svg",
    description: "Colar artesanal feito com sementes naturais da floresta amazônica.",
    longDescription: "Este colar Guarani é uma peça única, confeccionada manualmente por artesãos da tribo Guarani. Cada semente utilizada foi cuidadosamente selecionada e tratada, mantendo sua beleza natural. O colar representa a conexão do povo Guarani com a natureza e sua rica tradição cultural."
  },
  // ... outros produtos
];

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p.id === Number(id));

  if (!product) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl text-forest-900 mb-4">Produto não encontrado</h1>
        <button
          onClick={() => navigate("/produtos")}
          className="btn btn-secondary"
        >
          Voltar para Produtos
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    toast({
      title: "Produto adicionado ao carrinho!",
      description: `${quantity}x ${product.name}`,
    });
    // Aqui você implementaria a lógica real do carrinho
  };

  return (
    <div className="bg-white py-16 animate-fadeIn">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-sand-100 rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl font-marcellus text-forest-900">
              {product.name}
            </h1>
            <p className="text-2xl text-terra-600 font-semibold">
              R$ {product.price.toFixed(2)}
            </p>
            <p className="text-forest-700">
              {product.longDescription}
            </p>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-forest-600 hover:text-forest-800 transition-colors"
                aria-label="Diminuir quantidade"
              >
                <MinusCircle className="w-6 h-6" />
              </button>
              <span className="text-xl font-semibold text-forest-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="text-forest-600 hover:text-forest-800 transition-colors"
                aria-label="Aumentar quantidade"
              >
                <PlusCircle className="w-6 h-6" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn btn-primary w-full"
            >
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
