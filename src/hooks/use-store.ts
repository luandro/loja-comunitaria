import { useMemo } from 'react';
import { useSiteContent } from '@/context/SiteContentContext';
import { createStore, type Store } from '@/lib/store';

/**
 * Typed access layer for all customer-facing content.
 * Components should use this instead of reading `content.*` directly.
 */
export function useStore(): Store {
  const { content } = useSiteContent();
  return useMemo(() => createStore(content), [content]);
}
