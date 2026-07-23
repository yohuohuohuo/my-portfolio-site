import { DEMO_VALUES } from '../../types/demo-state';
import type { IUserInfo } from '../../types/api';

function createUser(greenId: number, rankPlace: number, total: number, infoType: IUserInfo['infoType']): IUserInfo {
  return {
    greenId,
    greenIdStatus: 0,
    inviteCode: DEMO_VALUES.inviteCode,
    level: 1,
    mfDailyAmounts: String(DEMO_VALUES.dailyReward),
    mfDailyStatus: 0,
    mfInviteAmounts: String(DEMO_VALUES.inviteReward),
    mfInviteStatus: 0,
    mfTotalAmounts: String(total),
    rankVO: {
      wallet: `demo-user-${greenId}`,
      mfTotalAmounts: String(total),
      rankPlace,
      domain: `forest-${greenId}.local`,
    },
    stealTimes: 0,
    time: 0,
    turntableTimes: 0,
    wallet: `demo-user-${greenId}`,
    greenIdSpeedAmounts: '0',
    domain: greenId === 1001 ? DEMO_VALUES.userDomain : `forest-${greenId}.local`,
    canStolenAmounts: String(DEMO_VALUES.stealReward),
    stolenStatus: 0,
    signature: '',
    inviteSignature: '',
    inviteNumber: greenId === 1001 ? 4 : 0,
    inviteSpeedAmounts: '0.8',
    infoType,
  };
}

export function createUserFixtures(): Record<string, IUserInfo> {
  return {
    '1001': createUser(1001, 1, DEMO_VALUES.initialMf, 'mine'),
    '2001': createUser(2001, 2, 1800, 'other'),
    '2002': createUser(2002, 3, 1500, 'other'),
    '2003': createUser(2003, 4, 1200, 'other'),
    '2004': createUser(2004, 5, 900, 'other'),
  };
}
