import { createBoxFixtures, createInviteFixtures, createNewsFixtures, createRankFixtures, createTaskFixtures } from './content.fixture';
import { createUserFixtures } from './users.fixture';
import { DEMO_VALUES, MINT_FOREST_SCHEMA_VERSION, type MintForestDemoState } from '../../types/demo-state';

export function createSeedState(): MintForestDemoState {
  const users = createUserFixtures();

  return {
    schemaVersion: MINT_FOREST_SCHEMA_VERSION,
    session: { loggedIn: false, token: '', userGreenId: '1001' },
    selectedForestId: null,
    users,
    claims: { greenId: false, daily: false, invite: false, claimedTaskIds: [] },
    visitedForestIds: ['1001'],
    stolenForestIds: [],
    config: {
      levelConfig: [...DEMO_VALUES.levelConfig],
      totalStealLimit: DEMO_VALUES.totalStealLimit,
      maxSpin: DEMO_VALUES.maxSpin,
      turntableSpent: DEMO_VALUES.spinCost,
      turntableRewards: [...DEMO_VALUES.spinRewards],
    },
    spinRewardCursor: 0,
    spinHistory: [],
    boxes: createBoxFixtures(),
    nfts: [],
    tasks: createTaskFixtures(),
    invites: createInviteFixtures(),
    activities: [],
    news: createNewsFixtures(),
    readNewsTimes: [],
    preferences: { audioMuted: false },
    nextEventSequence: 0,
  };
}

export const DEMO_RANK_FIXTURES = createRankFixtures();
