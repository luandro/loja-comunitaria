import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useStore } from "@/hooks/use-store";
import { Seo } from "@/components/Seo";
import { pageTitle } from "@/lib/seo";

const NotFound = () => {
  const location = useLocation();
  const store = useStore();

  useEffect(() => {
    console.error("404: rota inexistente:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="bg-sand-50 py-24 animate-fadeIn">
      <Seo title={pageTitle([store.t("not_found_title"), store.storeName])} noindex />
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-marcellus text-forest-900 mb-4">
          {store.t("not_found_title")}
        </h1>
        <p className="text-forest-700 mb-6">{store.t("not_found_description")}</p>
        <Link to="/" className="btn btn-primary">
          {store.t("back_to_home")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
