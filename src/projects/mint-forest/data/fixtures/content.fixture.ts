import type { BoxItem, ForestConfigItem, InviteItem, NewsGroup, RankItem, TaskItem } from '../../types/api';
import { DEMO_VALUES } from '../../types/demo-state';

const DEMO_DATE = DEMO_VALUES.baseEventTime;
const TASK_LOGO = '/projects/mint-forest/images/ic-task.png';

export function createConfigFixture(): ForestConfigItem[] {
  return [
    {
      type: 'CONFIG_LEVEL',
      config: DEMO_VALUES.levelConfig.map((amount, index) => ({
        amount: String(amount),
        id: index + 1,
        kind: 0,
        name: `Level ${index + 1}`,
        unit: 'MF',
      })),
    },
    {
      type: 'CONFIG_TURNTABLE',
      config: DEMO_VALUES.spinRewards.map((amount, index) => ({
        amount: String(amount),
        id: index + 1,
        kind: 0,
        name: `${amount} MF`,
        unit: 'MF',
      })),
    },
    {
      type: 'CONFIG_STEAL_LIMIT_TIMES',
      config: [{ amount: String(DEMO_VALUES.totalStealLimit), id: 0, kind: 0, name: 'Steal limit', unit: '' }],
    },
    {
      type: 'CONFIG_TURNTABLE_LIMIT_TIMES',
      config: [{ amount: String(DEMO_VALUES.maxSpin), id: 0, kind: 0, name: 'Turntable limit', unit: '' }],
    },
    {
      type: 'CONFIG_TURNTABLE_SUBTRACT_MF',
      config: [{ amount: String(DEMO_VALUES.spinCost), id: 0, kind: 0, name: 'Spin cost', unit: 'MF' }],
    },
  ];
}

export function createTaskFixtures(): TaskItem[] {
  return [
    { id: 1, taskName: 'GreenID', taskTitle: 'Claim GreenID', description: 'Claim your local GreenID demo.', logo: TASK_LOGO, link: '/mint-forest', linkButton: 'Open', mf: 0, done: 0, status: 0, startDate: 0, endDate: 0 },
    { id: 2, taskName: 'Follow X', taskTitle: 'Follow X', description: 'Simulate the social task locally.', logo: TASK_LOGO, link: '/mint-forest', linkButton: 'Verify', mf: DEMO_VALUES.taskRewards[2], done: 0, status: 0, startDate: 0, endDate: 0 },
    { id: 3, taskName: 'Discord', taskTitle: 'Join Discord', description: 'Use the local demo code to verify.', logo: TASK_LOGO, link: '/mint-forest', linkButton: 'Verify', mf: DEMO_VALUES.taskRewards[3], done: 0, status: 0, startDate: 0, endDate: 0 },
    { id: 4, taskName: 'Bridge', taskTitle: 'Bridge to Mint', description: 'Enter a local 0x demo hash.', logo: TASK_LOGO, link: '/mint-forest', linkButton: 'Verify', mf: DEMO_VALUES.taskRewards[4], done: 0, status: 0, startDate: 0, endDate: 0 },
    { id: 6, taskName: 'RedotPay', taskTitle: 'Verify RedotPay', description: 'Enter a local demo UID.', logo: TASK_LOGO, link: '/mint-forest', linkButton: 'Verify', mf: DEMO_VALUES.taskRewards[6], done: 0, status: 0, startDate: 0, endDate: 0 },
  ];
}

export function createRankFixtures(): RankItem[] {
  return [
    { wallet: 'demo-user-2001', domain: 'forest-2001.local', mfTotalAmounts: 1800, rankPlace: 2, greenId: 2001 },
    { wallet: 'demo-user-2002', domain: 'forest-2002.local', mfTotalAmounts: 1500, rankPlace: 3, greenId: 2002 },
    { wallet: 'demo-user-2003', domain: 'forest-2003.local', mfTotalAmounts: 1200, rankPlace: 4, greenId: 2003 },
    { wallet: 'demo-user-2004', domain: 'forest-2004.local', mfTotalAmounts: 900, rankPlace: 5, greenId: 2004 },
  ];
}

export function createInviteFixtures(): InviteItem[] {
  return [
    { greenId: '2001', wallet: 'demo-user-2001', domain: 'forest-2001.local', inviteTime: DEMO_DATE, mfTotalAmounts: 1800 },
  ];
}

export function createBoxFixtures(): BoxItem[] {
  return [
    { wallet: 'demo-user-1001', boxNumber: 501, boxId: 501, name: 'Demo Mystery Box', speedAmount: '150', status: 0, createTime: DEMO_DATE, openTime: '', signature: '' },
    { wallet: 'demo-user-1001', boxNumber: 502, boxId: 502, name: 'Demo Event Box', speedAmount: '250', status: 0, createTime: DEMO_DATE, openTime: '', signature: '' },
  ];
}

export function createNewsFixtures(): NewsGroup[] {
  return [
    {
      time: DEMO_DATE,
      announcements: [
        { createTime: DEMO_DATE, title: 'Local Demo Ready', content: 'Mint Forest is running with deterministic local data.', link: '/mint-forest' },
      ],
    },
  ];
}
