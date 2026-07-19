import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fetchProducts } from "../shared";

export default defineTool({
  name: "get_product",
  title: "Get product",
  description: "Get full details for a single product by its numeric id.",
  inputSchema: {
    id: z.number().int().positive().describe("Product id (matches the 'id' column in the catalog)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ id }) => {
    const products = await fetchProducts();
    const product = products.find((p) => p.id === id);
    if (!product) {
      return {
        content: [{ type: "text", text: `Nenhum produto encontrado com id ${id}.` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(product, null, 2) }],
      structuredContent: { product },
    };
  },
});
