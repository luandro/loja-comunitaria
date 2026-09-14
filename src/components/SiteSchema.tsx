import { useEffect } from 'react';
import { useStore } from '@/hooks/use-store';
import { absoluteUrl } from '@/lib/seo';

/**
 * Sitewide Organization + WebSite structured data, built from the spreadsheet
 * content in the browser. Injected once, updated when the content changes.
 */
export const SiteSchema = () => {
  const store = useStore();
  const { storeName, tagline } = store;
  const email = store.contact.email;
  const location = store.contact.location;
  const instagram = store.contact.instagramUrl;
  const facebook = store.contact.facebookUrl;
  const logo = store.optional('logo_url');

  useEffect(() => {
    if (!storeName) return;
    const sameAs = [instagram, facebook].filter(Boolean);
    const organization: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: storeName,
      url: absoluteUrl('/'),
      ...(tagline ? { description: tagline } : {}),
      ...(logo ? { logo } : {}),
      ...(email ? { email } : {}),
      ...(location ? { address: { '@type': 'PostalAddress', addressLocality: location } } : {}),
      ...(sameAs.length ? { sameAs } : {}),
    };
    const website = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: storeName,
      url: absoluteUrl('/'),
      inLanguage: store.language,
    };

    const nodes = [organization, website].map((block) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-site', 'true');
      script.textContent = JSON.stringify(block);
      document.head.appendChild(script);
      return script;
    });
    return () => nodes.forEach((n) => n.remove());
  }, [storeName, tagline, logo, email, location, instagram, facebook, store.language]);

  return null;
};

export default SiteSchema;
