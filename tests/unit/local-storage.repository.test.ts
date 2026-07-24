import { describe, expect, it } from 'vitest';
import { createSeedState } from '@/projects/mint-forest/data/fixtures/seed.fixture';
import { createMintForestRepository } from '@/projects/mint-forest/data/local-storage.repository';
import { DEMO_VALUES, MINT_FOREST_SCHEMA_VERSION } from '@/projects/mint-forest/types/demo-state';

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('Mint Forest local storage repository', () => {
  it('seeds missing storage and persists updates', () => {
    const storage = createMemoryStorage();
    const repository = createMintForestRepository(() => storage);

    const initial = repository.get();
    expect(initial.schemaVersion).toBe(MINT_FOREST_SCHEMA_VERSION);
    expect(initial.session.loggedIn).toBe(false);

    const updated = repository.update((state) => ({
      ...state,
      session: { ...state.session, loggedIn: true, token: 'demo-session-v1' },
    }));

    expect(updated.session.loggedIn).toBe(true);
    expect(repository.get().session.token).toBe('demo-session-v1');
  });

  it('recovers from invalid JSON and incompatible schema versions', () => {
    const storage = createMemoryStorage();
    const repository = createMintForestRepository(() => storage);
    const seed = createSeedState();

    storage.setItem('portfolio:mint-forest:v1', '{invalid');
    expect(repository.get().session.loggedIn).toBe(false);

    storage.setItem(
      'portfolio:mint-forest:v1',
      JSON.stringify({ ...seed, schemaVersion: 99 }),
    );
    expect(repository.get().schemaVersion).toBe(MINT_FOREST_SCHEMA_VERSION);
  });

  it('reseeds persisted state when its spin rewards no longer match the wheel', () => {
    const storage = createMemoryStorage();
    const repository = createMintForestRepository(() => storage);
    const staleState = createSeedState();
    staleState.session = { loggedIn: true, token: 'demo-session-v1', userGreenId: '1001' };
    staleState.config.turntableRewards = [500, 50, 200, 1000, 100];
    storage.setItem('portfolio:mint-forest:v1', JSON.stringify(staleState));

    const current = repository.get();

    expect(current.session.loggedIn).toBe(false);
    expect(current.config.turntableRewards).toEqual(DEMO_VALUES.spinRewards);
  });

  it('works in an SSR-like environment without a storage object', () => {
    const repository = createMintForestRepository(() => null);

    expect(() => repository.get()).not.toThrow();
    expect(repository.get().schemaVersion).toBe(MINT_FOREST_SCHEMA_VERSION);
    expect(repository.update((state) => state).schemaVersion).toBe(MINT_FOREST_SCHEMA_VERSION);
  });

  it('resets to a deep-cloned seed without leaking mutations', () => {
    const storage = createMemoryStorage();
    const repository = createMintForestRepository(() => storage);

    repository.update((state) => ({
      ...state,
      users: { ...state.users, '1001': { ...state.users['1001'], mfTotalAmounts: '0' } },
    }));
    const reset = repository.reset();
    reset.users['1001'].mfTotalAmounts = '1';

    expect(repository.get().users['1001'].mfTotalAmounts).toBe('2400');
  });
});
