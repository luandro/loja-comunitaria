/**
 * Guarded service-worker registration.
 * The worker is only allowed in the real published app — never in dev,
 * never inside the Lovable preview iframe, and never with `?sw=off`.
 */

const SW_URL = '/sw.js';

function isBlockedContext(): boolean {
  if (!import.meta.env.PROD) return true;
  if (typeof window === 'undefined') return true;
  if (window.self !== window.top) return true;

  const host = window.location.hostname;
  const previewHost =
    host.startsWith('id-preview--') ||
    host.startsWith('preview--') ||
    host === 'lovableproject.com' ||
    host.endsWith('.lovableproject.com') ||
    host === 'lovableproject-dev.com' ||
    host.endsWith('.lovableproject-dev.com') ||
    host === 'beta.lovable.dev' ||
    host.endsWith('.beta.lovable.dev');
  if (previewHost) return true;

  return new URLSearchParams(window.location.search).has('sw=off') ||
    new URLSearchParams(window.location.search).get('sw') === 'off';
}

async function unregisterAppWorkers() {
  if (!('serviceWorker' in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    registrations
      .filter((r) => (r.active?.scriptURL ?? r.installing?.scriptURL ?? '').endsWith(SW_URL))
      .map((r) => r.unregister()),
  );
}

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  if (isBlockedContext()) {
    void unregisterAppWorkers();
    return;
  }

  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(SW_URL).catch(() => {
      /* offline support is best-effort */
    });
  });
}
