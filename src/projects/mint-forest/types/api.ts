export enum HttpCode {
  Success = 200,
  Error = 500,
  NoData = 5001,
  NotEligible = 5002,
  InvalidParams = 5003,
  InvalidMethod = 5004,
  AuthFailed = 401,
}

export type AuthType = 'Required' | 'Optional' | 'Ignored';

export enum GreenIdStatusEnum {
  NoGreenId = 'no_greenid',
  NotActive = 'not_active',
  Actived = 'actived',
}

export interface IUserInfo {
  greenId: number;
  greenIdStatus: number;
  inviteCode: string;
  level: number;
  mfDailyAmounts: string;
  mfDailyStatus: number;
  mfInviteAmounts: string;
  mfInviteStatus: number;
  mfTotalAmounts: string;
  rankVO: { wallet: string; mfTotalAmounts: string; rankPlace: number; domain: string };
  stealTimes: number;
  time: number;
  turntableTimes: number;
  wallet: string;
  greenIdSpeedAmounts: string;
  domain?: string;
  canStolenAmounts: string;
  stolenStatus: number;
  signature: string;
  inviteSignature?: string;
  inviteNumber: number;
  inviteSpeedAmounts: string;
  infoType: 'mine' | 'other';
}

export interface ForestConfigItem {
  type:
    | 'CONFIG_LEVEL'
    | 'CONFIG_TURNTABLE'
    | 'CONFIG_TURNTABLE_LIMIT_TIMES'
    | 'CONFIG_STEAL_LIMIT_TIMES'
    | 'CONFIG_TURNTABLE_SUBTRACT_MF';
  config: Array<{ amount: string; id: number; kind: number; name: string; unit: 'MF' | '' }>;
}

export interface TaskItem {
  id: number;
  taskName: string;
  taskTitle: string;
  description: string;
  logo: string;
  link: string;
  linkButton: string;
  mf: number;
  done: number;
  status: 0 | 1;
  startDate: number;
  endDate: number;
}

export interface RankItem {
  wallet: string;
  domain: string;
  mfTotalAmounts: string | number;
  rankPlace: number;
  greenId?: number;
}

export interface InviteItem {
  greenId: string;
  wallet: string;
  domain: string;
  inviteTime: string;
  mfTotalAmounts: number;
}

export interface ActivityItem {
  wallet: string;
  domain: string;
  txType: number;
  txHash: string;
  status: number;
  contract: string;
  tokenId: string;
  destination: string;
  amount: number;
  targetId: number;
  turntableUnit: string;
  name: string;
  createTime: string;
}

export interface BoxItem {
  wallet: string;
  boxNumber: number;
  boxId: number;
  name: string;
  speedAmount: string;
  status: number;
  createTime: string;
  openTime: string;
  signature: string;
}

export interface NftItem {
  nftUniqueNum: string;
  contract: string;
  tokenId: string;
  name: string;
  logo: string;
  speedAmount: string;
}

export type OpenBoxResponse = BoxItem;

export interface SpinResult {
  signature: string;
  turntableId: number;
  times: number;
  amount: string;
  sectorIndex?: number;
}

export interface TaskVerifyResult {
  taskId: number;
  status: 'completed';
  reward: number;
}

export interface NewsAnnouncement {
  createTime: string;
  title: string;
  content: string;
  link: string;
}

export interface NewsGroup {
  time: string;
  announcements: NewsAnnouncement[];
}
