import { getEnv } from './env';

/**
 * Optional `Comunidades` spreadsheet tab.
 *
 * The store MUST keep working without this tab: every loader failure resolves
 * to an empty list and community routes simply show "not found".
 * No text here is invented — everything comes from the sheet.
 */
export interface Community {
  slug: string;
  name: string;
  description?: string;
  location?: string;
  heroImage?: string;
  whatsappNumber?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  email?: string;
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const pick = (row: Record<string, unknown>, ...keys: string[]): string => {
  for (const k of keys) {
    const v = row[k] ?? row[k.toLowerCase()];
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
};

function rowToCommunity(row: Record<string, unknown>): Community | null {
  const name = pick(row, 'name', 'nome', 'community', 'comunidade', 'povo_ou_comunidade');
  if (!name) return null;
  const slug = pick(row, 'slug', 'identificador') || slugify(name);
  return {
    slug: slugify(slug),
    name,
    description: pick(row, 'description', 'descricao', 'texto') || undefined,
    location: pick(row, 'location', 'localizacao', 'local', 'origin_location', 'local_de_origem') || undefined,
    heroImage:
      pick(row, 'hero_image_url', 'url_imagem_hero', 'image', 'imagem', 'url_imagem') || undefined,
    whatsappNumber: pick(row, 'whatsapp_number', 'numero_whatsapp', 'whatsapp') || undefined,
    instagramUrl: pick(row, 'instagram_url', 'url_instagram', 'instagram') || undefined,
    websiteUrl: pick(row, 'website_url', 'url_site', 'site') || undefined,
    email: pick(row, 'email', 'email_contato') || undefined,
  };
}

let cache: Promise<Community[]> | null = null;

export async function loadCommunities(): Promise<Community[]> {
  const spreadsheetId = getEnv('GOOGLE_SPREADSHEET_ID');
  const tab = getEnv('GOOGLE_SPREADSHEET_COMMUNITIES_TAB');
  if (!spreadsheetId || !tab) return [];

  try {
    const res = await fetch(`https://opensheet.elk.sh/${spreadsheetId}/${tab}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = (await res.json()) as Array<Record<string, unknown>>;
    return rows.map(rowToCommunity).filter((c): c is Community => c !== null);
  } catch (err) {
    console.info('[COMMUNITIES] Optional Comunidades tab unavailable:', err);
    return [];
  }
}

/** Cached loader — the tab is optional and rarely changes within a session. */
export function getCommunities(): Promise<Community[]> {
  if (!cache) cache = loadCommunities();
  return cache;
}
