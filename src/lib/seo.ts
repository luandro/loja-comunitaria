/**
 * Client-side SEO helpers.
 *
 * The catalog is fetched from a public spreadsheet at runtime, so any
 * product-specific tag written here is applied in the browser. Crawlers that
 * execute JavaScript (Google) read it; simple social-preview crawlers only see
 * the static tags in `index.html`. This is documented in the README.
 */

export interface JsonLd {
  [key: string]: unknown;
}

/** Absolute URL for a route path, resolved against the current origin. */
export function absoluteUrl(path = '/'): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${clean}`;
}

/** Trim a description to a crawler-friendly length without cutting words. */
export function clampDescription(value: string, max = 155): string {
  const text = value.replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

export function pageTitle(parts: (string | undefined)[]): string {
  return parts.filter((p) => p && p.trim()).join(' · ');
}
