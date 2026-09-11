import { useCallback, useEffect, useState } from 'react';
import { readJSON, writeJSON } from '@/shared/utils/storage';
import { createChild, listChildren } from './api';
import type { Child } from './model';

const cacheKey = (userId: string) => `maths-garden:children:${userId}`;

/** The signed-in parent's child profiles: cached on the device (so the iPad opens offline), refreshed from Supabase. */
export function useChildren(userId: string) {
  const [profiles, setProfiles] = useState<Child[]>(() => readJSON(cacheKey(userId), []));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let live = true;
    listChildren()
      .then((list) => {
        if (!live) return;
        setProfiles(list);
        writeJSON(cacheKey(userId), list);
      })
      .catch(() => {
        // offline: keep the cached list
      })
      .finally(() => {
        if (live) setLoaded(true);
      });
    return () => {
      live = false;
    };
  }, [userId]);

  const create = useCallback(
    async (input: Omit<Child, 'id'>) => {
      const child = await createChild(input);
      setProfiles((current) => {
        const next = [...current, child];
        writeJSON(cacheKey(userId), next);
        return next;
      });
      return child;
    },
    [userId],
  );

  return { profiles, loaded, create };
}
