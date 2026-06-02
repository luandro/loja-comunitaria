import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  DEFAULT_SITE_CONTENT,
  hexToHslTriplet,
  loadSiteContent,
  type SiteContent,
} from '@/lib/site-content';

interface SiteContentContextType {
  content: SiteContent;
  isLoading: boolean;
}

const SiteContentContext = createContext<SiteContentContextType>({
  content: DEFAULT_SITE_CONTENT,
  isLoading: true,
});

// Session cache for site content. While editing the spreadsheet, lower
// CACHE_TTL (e.g. to 0) or clear sessionStorage to force a fresh fetch.
const CACHE_KEY = 'siteContentCache';
const CACHE_TTL = 5 * 60 * 1000;

export const SiteContentProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<SiteContent>(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const { content, timestamp } = JSON.parse(raw);
        if (Date.now() - timestamp < CACHE_TTL) return content;
      }
    } catch {
      /* ignore */
    }
    return DEFAULT_SITE_CONTENT;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadSiteContent().then((data) => {
      if (cancelled) return;
      setContent(data);
      setIsLoading(false);
      try {
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ content: data, timestamp: Date.now() }),
        );
      } catch {
        /* ignore */
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync document title + meta description from the sheet
  useEffect(() => {
    if (content.meta_title) document.title = content.meta_title;
    if (content.meta_description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content.meta_description);
    }
    if (content.favicon_url) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = content.favicon_url;
    }
    // og:image
    if (content.og_image_url) {
      let tag = document.querySelector('meta[property="og:image"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', 'og:image');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content.og_image_url);
    }
    // Theme colors → override CSS variables on :root when hex values are provided
    const root = document.documentElement;
    const themeMap: Array<[string, string]> = [
      [content.primary_color, '--primary'],
      [content.secondary_color, '--secondary'],
      [content.accent_color, '--accent'],
      [content.background_color, '--background'],
    ];
    for (const [hex, cssVar] of themeMap) {
      if (!hex) continue;
      const hsl = hexToHslTriplet(hex);
      if (hsl) root.style.setProperty(cssVar, hsl);
    }
  }, [
    content.meta_title,
    content.meta_description,
    content.favicon_url,
    content.og_image_url,
    content.primary_color,
    content.secondary_color,
    content.accent_color,
    content.background_color,
  ]);

  return (
    <SiteContentContext.Provider value={{ content, isLoading }}>
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => useContext(SiteContentContext);
