import type { ActivityItem, BoxItem, InviteItem, IUserInfo, NewsGroup, NftItem, TaskItem } from './api';

export const MINT_FOREST_STORAGE_KEY = 'portfolio:mint-forest:v1';
export const MINT_FOREST_SCHEMA_VERSION = 1 as const;

export const DEMO_VALUES = {
  userGreenId: '1001',
  userDomain: 'local.demo',
  inviteCode: 'FOREST-DEMO',
  baseEventTime: '2026-07-10T00:00:00.000Z',
  initialMf: 2400,
  dailyReward: 120,
  inviteReward: 80,
  stealReward: 60,
  totalStealLimit: 3,
  maxSpin: 5,
  spinCost: 100,
  // Clockwise from the pointer's starting position in pic-spin.svg.
  spinRewards: [50, 100, 500, 2000, 8000, 2000],
  boxRewards: { 501: 150, 502: 250 },
  taskRewards: { 2: 50, 3: 50, 4: 100, 6: 80 },
  levelConfig: [1000, 3000, 6000, 10000, 20000],
} as const;

export type DemoBox = BoxItem;
export type DemoNft = NftItem;
export type DemoTask = TaskItem;
export type DemoInvite = InviteItem;
export type DemoActivity = ActivityItem;
export type DemoNewsGroup = NewsGroup;

export interface DemoSpinRecord {
  id: string;
  amount: number;
  spent: number;
  times: number;
  createTime: string;
}

export interface MintForestDemoState {
  schemaVersion: 1;
  session: {
    loggedIn: boolean;
    token: 'demo-session-v1' | '';
    userGreenId: '1001';
  };
  selectedForestId: string | null;
  users: Record<string, IUserInfo>;
  claims: {
    greenId: boolean;
    daily: boolean;
    invite: boolean;
    claimedTaskIds: number[];
  };
  visitedForestIds: string[];
  stolenForestIds: string[];
  config: {
    levelConfig: number[];
    totalStealLimit: number;
    maxSpin: number;
    turntableSpent: number;
    turntableRewards: number[];
  };
  spinRewardCursor: number;
  spinHistory: DemoSpinRecord[];
  boxes: DemoBox[];
  nfts: DemoNft[];
  tasks: DemoTask[];
  invites: DemoInvite[];
  activities: DemoActivity[];
  news: DemoNewsGroup[];
  readNewsTimes: string[];
  preferences: { audioMuted: boolean };
  nextEventSequence: number;
}
