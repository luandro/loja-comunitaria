import { useStore } from "@/hooks/use-store";

const About = () => {
  const store = useStore();
  const aboutText = store.optional("about_text");
  const aboutImage = store.optional("about_image_url");
  const cards = [
    { key: "mission", title: store.t("mission_title"), text: store.optional("mission_text") },
    { key: "values", title: store.t("values_title"), text: store.optional("values_text") },
    {
      key: "commitment",
      title: store.t("commitment_title"),
      text: store.optional("commitment_text"),
    },
  ].filter((card) => card.text);

  return (
    <div className="bg-sand-50 py-16 animate-fadeIn">
      <div className="container mx-auto">
        <h1 className="text-4xl font-marcellus text-forest-900 text-center mb-12">
          {store.text("about_title", "about_title_fallback")}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <p className="text-forest-700 whitespace-pre-line">{aboutText}</p>
          </div>
          {aboutImage && (
            <div className="aspect-square bg-sand-200 rounded-lg overflow-hidden">
              <img
                src={aboutImage}
                alt={store.storeName}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {cards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {cards.map((card) => (
              <div key={card.key} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-marcellus text-forest-900 mb-4">{card.title}</h3>
                <p className="text-forest-700">{card.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default About;
