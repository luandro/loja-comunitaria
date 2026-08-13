import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { useCommunities } from "@/hooks/use-communities";
import { useStore } from "@/hooks/use-store";
import { slugify } from "@/lib/communities";

const CommunityPage = () => {
  const { slug = "" } = useParams();
  const store = useStore();
  const { communities, isLoading } = useCommunities();
  const { products } = useProducts();

  const community = useMemo(
    () => communities.find((c) => c.slug === slugify(slug)),
    [communities, slug],
  );

  const communityProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          (p.communitySlug && slugify(p.communitySlug) === slugify(slug)) ||
          (p.peopleOrCommunity && slugify(p.peopleOrCommunity) === slugify(slug)),
      ),
    [products, slug],
  );

  const title = community?.name || communityProducts[0]?.peopleOrCommunity;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest-700" />
      </div>
    );
  }

  if (!title) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl font-marcellus text-forest-900 mb-4">
          {store.t("community_not_found")}
        </h1>
        <Link to="/produtos" className="text-terra-600 underline">
          {store.t("back_to_products")}
        </Link>
      </div>
    );
  }

  const links = [
    community?.websiteUrl && { label: "Site", href: community.websiteUrl },
    community?.instagramUrl && { label: "Instagram", href: community.instagramUrl },
    community?.email && { label: store.t("email"), href: `mailto:${community.email}` },
    community?.whatsappNumber && {
      label: store.t("whatsapp"),
      href: `https://api.whatsapp.com/send?phone=${community.whatsappNumber.replace(/\D/g, "")}`,
    },
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  return (
    <div className="bg-sand-50 py-12 animate-fadeIn">
      <div className="container mx-auto">
        {community?.heroImage && (
          <div className="mb-8 rounded-lg overflow-hidden aspect-[16/9] md:aspect-[21/9]">
            <img
              src={community.heroImage}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-marcellus text-forest-900">{title}</h1>
        {community?.location && (
          <p className="mt-1 text-sm text-forest-600">{community.location}</p>
        )}
        {community?.description && (
          <p className="mt-4 max-w-3xl text-forest-700 whitespace-pre-line">
            {community.description}
          </p>
        )}

        {links.length > 0 && (
          <div className="mt-6">
            <h2 className="sr-only">{store.t("community_links_title")}</h2>
            <ul className="flex flex-wrap gap-4 text-sm">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-terra-600 underline"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {communityProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-marcellus text-forest-900 mb-6">
              {store.t("community_page_products_title")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {communityProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
