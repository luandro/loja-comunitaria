import { useNavigate } from "react-router-dom";
import { useStore } from "@/hooks/use-store";

export const EmptyCart = () => {
  const navigate = useNavigate();
  const store = useStore();

  return (
    <div className="bg-sand-50 py-16 animate-fadeIn min-h-[50vh]">
      <div className="container mx-auto text-center">
        <h1 className="text-2xl text-forest-900 mb-4">{store.t("cart_empty_title")}</h1>
        <button onClick={() => navigate("/produtos")} className="btn btn-primary">
          {store.t("continue_shopping")}
        </button>
      </div>
    </div>
  );
};
