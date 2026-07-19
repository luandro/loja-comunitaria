import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fetchProducts } from "../shared";

export default defineTool({
  name: "search_products",
  title: "Search products",
  description:
    "Search the catalog by keyword. Matches product name, description, category, materials and community/people of origin.",
  inputSchema: {
    query: z.string().trim().min(1).describe("Search terms (Portuguese or English)."),
    limit: z.number().int().positive().max(50).optional().describe("Max results (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ query, limit }) => {
    const q = query.toLowerCase();
    const all = await fetchProducts();
    const matches = all.filter((p) => {
      const hay = [
        p.name,
        p.description,
        p.longDescription,
        p.category,
        p.materials,
        p.peopleOrCommunity,
        p.originLocation,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
    const results = matches.slice(0, limit ?? 20);
    return {
      content: [
        {
          type: "text",
          text: `${results.length} de ${matches.length} resultado(s) para "${query}".\n\n${results
            .map((p) => `#${p.id} — ${p.name} — R$ ${p.price.toFixed(2)} — ${p.productUrl}`)
            .join("\n")}`,
        },
      ],
      structuredContent: { results, totalMatches: matches.length },
    };
  },
});
