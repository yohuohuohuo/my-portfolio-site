import { random } from 'lodash';

export const getSignMessage = (address: string) => {
  return `You are participating in the Mint Forest event: \n ${address} \n Nonce: ${random(1000000, 9999999)}`;
};

export const greenIdTokenUrl = (token_id: number | null | string) => {
  return `https://www.mintchain.io/api/greenid/image/${token_id}`;
};

export const getInviteUrl = (inviteCode: string) => {
  return `${location.protocol}//${location.host}/?inviteCode=${inviteCode}`;
};

export function energyToLevel(LvConfig: number[], energy: number) {
  let lv = 1;
  for (let index = 1; index < LvConfig.length + 1; index++) {
    const current = LvConfig[index - 1];
    const next = LvConfig[index];

    if (energy <= current || !next) {
      lv = index;
      break;
    }
  }
  return lv;
}
