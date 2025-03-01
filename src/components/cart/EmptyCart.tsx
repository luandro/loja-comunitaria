import { useNavigate } from "react-router-dom";

export const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-16 text-center animate-fadeIn">
      <h1 className="text-2xl text-forest-900 mb-4">Seu carrinho está vazio</h1>
      <button
        onClick={() => navigate("/produtos")}
        className="btn btn-primary"
      >
        Continuar Comprando
      </button>
    </div>
  );
};