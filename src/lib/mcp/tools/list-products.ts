import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fetchProducts } from "../shared";

export default defineTool({
  name: "list_products",
  title: "List products",
  description:
    "List active products from the Loja Comunitária catalog. Optionally filter to featured items or by category, and limit the number of results.",
  inputSchema: {
    featuredOnly: z
      .boolean()
      .optional()
      .describe("If true, only return products marked as featured/destaque."),
    category: z
      .string()
      .optional()
      .describe("Case-insensitive category filter (e.g. 'cestaria', 'colares')."),
    limit: z
      .number()
      .int()
      .positive()
      .max(100)
      .optional()
      .describe("Maximum number of products to return. Default: all."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ featuredOnly, category, limit }) => {
    let products = await fetchProducts();
    if (featuredOnly) products = products.filter((p) => p.featured);
    if (category) {
      const c = category.toLowerCase();
      products = products.filter((p) => (p.category ?? "").toLowerCase() === c);
    }
    if (limit) products = products.slice(0, limit);
    return {
      content: [
        {
          type: "text",
          text: `${products.length} produto(s) encontrado(s).\n\n${products
            .map((p) => `#${p.id} — ${p.name} — R$ ${p.price.toFixed(2)} — ${p.productUrl}`)
            .join("\n")}`,
        },
      ],
      structuredContent: { products },
    };
  },
});
