import { isEmpty } from './common.util';

export function ellipsis(rawString: string | `0x${string}`, firstLength: number, lastLength?: number) {
  if (isEmpty(rawString) || typeof rawString !== 'string') return rawString;

  const realLastLength = lastLength == undefined ? firstLength : lastLength;

  if (rawString.length <= firstLength + realLastLength) return rawString;

  let fullString = rawString;
  // if (fullString.includes('.')) {
  //   return `${fullString.substring(0, firstLength + realLastLength)}...`;
  // }

  return `${fullString.substring(0, firstLength)}...${fullString.substring(
    fullString.length - realLastLength,
    fullString.length
  )}`;
}
