import { defineTool } from "@lovable.dev/mcp-js";
import { fetchStoreContact } from "../shared";

export default defineTool({
  name: "get_store_contact",
  title: "Get store contact",
  description:
    "Return the store's public contact info: website URL, WhatsApp number and link, email, location, business hours, and social links.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async () => {
    const contact = await fetchStoreContact();
    return {
      content: [{ type: "text", text: JSON.stringify(contact, null, 2) }],
      structuredContent: { contact: { ...contact } },
    };
  },
});
