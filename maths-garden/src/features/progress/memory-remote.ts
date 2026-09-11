import { applyChange, childOf, emptyProgress, type Progress, type Remote } from './model';

/** A pretend server for Storybook: keeps writes in memory, per child. */
export function memoryRemote(seed: Record<string, Progress> = {}): Remote {
  const db = new Map(Object.entries(seed));
  return {
    async fetch(childId) {
      return structuredClone(db.get(childId) ?? emptyProgress());
    },
    async push(change) {
      const id = childOf(change);
      db.set(id, applyChange(db.get(id) ?? emptyProgress(), change));
    },
  };
}
