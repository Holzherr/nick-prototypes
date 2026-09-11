import { readJSON } from '@/shared/utils/storage';
import { emptyProgress, type Remote } from './model';
import { cacheKey } from './repo';

/** Guest mode: no server. The device cache is the only copy, so fetch returns it and every push succeeds at once. */
export const localRemote: Remote = {
  async fetch(childId) {
    return { ...emptyProgress(), ...readJSON(cacheKey(childId), {}) };
  },
  async push() {},
};
