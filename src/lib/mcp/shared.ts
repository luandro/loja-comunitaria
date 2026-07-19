// Shared helpers for MCP tools. Kept import-safe: no env reads or I/O at module top level.
// Vite inlines `import.meta.env.VITE_*` values as string literals at build time,
// so referencing them inside functions is safe in the emitted Deno function.

export interface McpProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  longDescription?: string;
  category?: string;
  featured?: boolean;
  quantity?: number;
  materials?: string;
  peopleOrCommunity?: string;
  originLocation?: string;
  dimensions?: string;
  productUrl: string;
}

const truthy = (v: unknown) => {
  if (v === undefined || v === null) return false;
  const s = String(v).trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "sim" || s === "y" || s === "verdadeiro";
};

const pick = (row: Record<string, unknown>, ...keys: string[]): string => {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
};

function siteOrigin(): string {
  return (
    (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined) ??
    "https://loja-comunitaria.lovable.app"
  );
}

function rowToProduct(row: Record<string, unknown>): McpProduct | null {
  const id = Number.parseInt(pick(row, "id"), 10);
  const name = pick(row, "name", "nome");
  const price = Number.parseFloat(
    pick(row, "price", "price_brl", "preco", "preco_brl").replace(",", "."),
  );
  if (!Number.isFinite(id) || !name || !Number.isFinite(price)) return null;

  const activeRaw = pick(row, "active", "ativo");
  const active = activeRaw === "" ? true : truthy(activeRaw);
  if (!active) return null;

  const qRaw = pick(row, "quantity", "stock_quantity", "quantidade_estoque");
  const quantity = qRaw ? Number.parseInt(qRaw, 10) : undefined;

  return {
    id,
    name,
    price,
    image: pick(row, "image", "image_url", "url_imagem") || "",
    description: pick(row, "description", "descricao", "short_description", "descricao_curta"),
    longDescription:
      pick(row, "longDescription", "details", "full_description", "detalhes") || undefined,
    category: pick(row, "category", "categoria") || undefined,
    featured: truthy(pick(row, "featured", "destaque")),
    quantity,
    materials: pick(row, "materials", "materiais") || undefined,
    peopleOrCommunity: pick(row, "people_or_community", "povo_ou_comunidade") || undefined,
    originLocation: pick(row, "origin_location", "local_de_origem") || undefined,
    dimensions: pick(row, "dimensions", "dimensoes") || undefined,
    productUrl: `${siteOrigin()}/produto/${id}`,
  };
}

export async function fetchProducts(): Promise<McpProduct[]> {
  const spreadsheetId =
    (import.meta.env.VITE_GOOGLE_SPREADSHEET_ID as string | undefined) ?? "";
  const tab = (import.meta.env.VITE_GOOGLE_SPREADSHEET_TAB as string | undefined) ?? "Produtos";
  if (!spreadsheetId) return [];

  const res = await fetch(`https://opensheet.elk.sh/${spreadsheetId}/${tab}`);
  if (!res.ok) throw new Error(`Failed to fetch products sheet: HTTP ${res.status}`);
  const rows = (await res.json()) as Array<Record<string, unknown>>;
  return rows.map(rowToProduct).filter((p): p is McpProduct => p !== null);
}

export interface StoreContact {
  siteUrl: string;
  whatsappNumber: string;
  whatsappLink: string;
  email?: string;
  location?: string;
  businessHours?: string;
  instagramUrl?: string;
  facebookUrl?: string;
}

export async function fetchStoreContact(): Promise<StoreContact> {
  const spreadsheetId =
    (import.meta.env.VITE_GOOGLE_SPREADSHEET_ID as string | undefined) ?? "";
  const contentTab =
    (import.meta.env.VITE_GOOGLE_SPREADSHEET_CONTENT_TAB as string | undefined) ??
    "Conteudo_Site";

  const envNumber = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? "";
  const envMessage = (import.meta.env.VITE_WHATSAPP_MESSAGE as string | undefined) ?? "";

  const contact: StoreContact = {
    siteUrl: siteOrigin(),
    whatsappNumber: envNumber,
    whatsappLink: envNumber
      ? `https://wa.me/${envNumber}${envMessage ? `?text=${encodeURIComponent(envMessage)}` : ""}`
      : "",
  };

  if (!spreadsheetId) return contact;
  try {
    const res = await fetch(`https://opensheet.elk.sh/${spreadsheetId}/${contentTab}`);
    if (!res.ok) return contact;
    const rows = (await res.json()) as Array<Record<string, string>>;
    const map: Record<string, string> = {};
    for (const row of rows) {
      const k = (row.key ?? row.Key ?? row.chave ?? row.Chave ?? "").toString().trim();
      const v = (row.value ?? row.Value ?? row.valor ?? row.Valor ?? "").toString();
      if (k && v.trim()) map[k] = v;
    }
    const number = map.whatsapp_number || map.numero_whatsapp || envNumber;
    const message = map.whatsapp_message || map.mensagem_whatsapp || envMessage;
    contact.whatsappNumber = number;
    contact.whatsappLink = number
      ? `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`
      : "";
    contact.email = map.email || undefined;
    contact.location = map.location || map.localizacao || undefined;
    contact.businessHours = map.business_hours || map.horario_atendimento || undefined;
    contact.instagramUrl = map.instagram_url || map.url_instagram || undefined;
    contact.facebookUrl = map.facebook_url || map.url_facebook || undefined;
  } catch {
    // fall back to env-only contact
  }
  return contact;
}
