import { useEffect, useState } from 'react';
import { getCommunities, type Community } from '@/lib/communities';

/**
 * Optional community profiles. Returns an empty list when the
 * `Comunidades` tab does not exist — the store keeps working.
 */
export function useCommunities() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getCommunities()
      .then((list) => active && setCommunities(list))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { communities, isLoading };
}
