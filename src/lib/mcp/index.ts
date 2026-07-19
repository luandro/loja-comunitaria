import { defineMcp } from "@lovable.dev/mcp-js";
import listProductsTool from "./tools/list-products";
import getProductTool from "./tools/get-product";
import searchProductsTool from "./tools/search-products";
import getStoreContactTool from "./tools/get-store-contact";

export default defineMcp({
  name: "loja-comunitaria-mcp",
  title: "Loja Comunitária MCP",
  version: "0.1.0",
  instructions:
    "Ferramentas públicas para consultar o catálogo da Loja Comunitária (artesanatos indígenas). " +
    "Use `list_products` para listar o catálogo, `search_products` para buscar por palavra-chave, " +
    "`get_product` para detalhes completos de um item, e `get_store_contact` para obter WhatsApp, email e demais canais da loja.",
  tools: [listProductsTool, searchProductsTool, getProductTool, getStoreContactTool],
});
