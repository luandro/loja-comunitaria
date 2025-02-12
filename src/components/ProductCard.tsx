
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

const ProductCard = ({ id, name, price, image, description }: ProductCardProps) => {
  return (
    <Link
      to={`/produto/${id}`}
      className="group product-card bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-forest-900 mb-1">{name}</h3>
        <p className="text-sm text-forest-600 mb-2 line-clamp-2">{description}</p>
        <p className="text-terra-600 font-semibold">
          R$ {price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
