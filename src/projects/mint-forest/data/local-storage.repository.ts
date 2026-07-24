import { createSeedState } from './fixtures/seed.fixture';
import { DEMO_VALUES, MINT_FOREST_SCHEMA_VERSION, MINT_FOREST_STORAGE_KEY, type MintForestDemoState } from '../types/demo-state';

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

type StorageGetter = () => StorageLike | null;

function cloneState(state: MintForestDemoState): MintForestDemoState {
  return JSON.parse(JSON.stringify(state)) as MintForestDemoState;
}

function defaultStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

function isValidState(value: unknown): value is MintForestDemoState {
  if (typeof value !== 'object' || value === null) return false;

  const state = value as { schemaVersion?: unknown; config?: { turntableRewards?: unknown } };
  const rewards = state.config?.turntableRewards;

  return (
    state.schemaVersion === MINT_FOREST_SCHEMA_VERSION &&
    Array.isArray(rewards) &&
    rewards.length === DEMO_VALUES.spinRewards.length &&
    rewards.every((reward, index) => reward === DEMO_VALUES.spinRewards[index])
  );
}

export function createMintForestRepository(getStorage: StorageGetter = defaultStorage) {
  const readSeed = () => cloneState(createSeedState());

  const read = (): MintForestDemoState => {
    const storage = getStorage();
    if (!storage) return readSeed();

    try {
      const raw = storage.getItem(MINT_FOREST_STORAGE_KEY);
      if (!raw) return readSeed();
      const parsed: unknown = JSON.parse(raw);
      if (!isValidState(parsed)) return readSeed();
      return cloneState(parsed);
    } catch {
      return readSeed();
    }
  };

  const write = (state: MintForestDemoState): MintForestDemoState => {
    const nextState = cloneState(state);
    try {
      getStorage()?.setItem(MINT_FOREST_STORAGE_KEY, JSON.stringify(nextState));
    } catch {
      // In-memory state remains usable when storage is unavailable or full.
    }
    return nextState;
  };

  return {
    get: read,
    update(updater: (state: MintForestDemoState) => MintForestDemoState) {
      return write(updater(read()));
    },
    reset() {
      return write(readSeed());
    },
    clear() {
      try {
        getStorage()?.removeItem(MINT_FOREST_STORAGE_KEY);
      } catch {
        // Clearing is best effort; the next read still returns a valid seed.
      }
      return readSeed();
    },
  };
}
