export enum EnvEnum {
  Prod = 'production',
  Dev = 'development',
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

export enum ForestChainHandlerEnum {
  Box = 'OpenReward',
  Steal = 'Steal',
  Signin = 'Signin',
  Turatable = 'Turntable',
  InviteClaim = 'InviteClaim',
}

export enum GreenIdStatusEnum {
  NoGreenId = 'no_greenid',
  NotActive = 'not_active',
  Actived = 'actived',
}
