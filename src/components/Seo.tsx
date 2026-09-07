import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { absoluteUrl, clampDescription, type JsonLd } from '@/lib/seo';

interface SeoProps {
  title: string;
  description?: string;
  image?: string;
  /** Canonical path (defaults to the current route path). */
  path?: string;
  noindex?: boolean;
  /** Structured data injected as JSON-LD (browser-side). */
  jsonLd?: JsonLd | JsonLd[];
}

const MANAGED = 'data-seo-managed';

function upsertMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    el.setAttribute(MANAGED, 'true');
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    el.setAttribute(MANAGED, 'true');
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Sets the document head for a route. No SSR is involved: everything happens
 * in the browser, after the catalog data resolves.
 */
export const Seo = ({ title, description, image, path, noindex, jsonLd }: SeoProps) => {
  const location = useLocation();
  const routePath = path ?? location.pathname;

  useEffect(() => {
    const canonical = absoluteUrl(routePath);
    document.title = title;
    upsertCanonical(canonical);
    upsertMeta('property', 'og:title', title);
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:type', routePath.startsWith('/produto/') ? 'product' : 'website');
    upsertMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');

    if (description) {
      const clean = clampDescription(description);
      upsertMeta('name', 'description', clean);
      upsertMeta('property', 'og:description', clean);
      upsertMeta('name', 'twitter:description', clean);
    }
    if (image) {
      upsertMeta('property', 'og:image', image);
      upsertMeta('name', 'twitter:image', image);
      upsertMeta('name', 'twitter:card', 'summary_large_image');
    }
  }, [title, description, image, routePath, noindex]);

  useEffect(() => {
    if (!jsonLd) return;
    const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
    const nodes = blocks.map((block) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute(MANAGED, 'true');
      script.textContent = JSON.stringify(block);
      document.head.appendChild(script);
      return script;
    });
    return () => nodes.forEach((n) => n.remove());
  }, [jsonLd]);

  return null;
};

export default Seo;
