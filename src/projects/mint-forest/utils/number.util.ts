import { round } from 'lodash';

export function formatNumber(number: any, places = 0) {
  return round(number, places).toLocaleString('en-US');
}

export function formatBigNumber(number: string | number, precision?: number) {
  const rawNumber = isNaN(Number(number)) ? 0 : Number(number);

  if (rawNumber == 0) return rawNumber;

  let realPrecision = precision || 1;
  if (rawNumber < 1) {
    realPrecision = 6;
  }

  let result: string | number = number;
  if (rawNumber >= 1e3 && rawNumber < 1e6) {
    result = round(rawNumber / 1e3, realPrecision) + 'K';
  } else if (rawNumber >= 1e6 && rawNumber < 1e9) {
    result = round(rawNumber / 1e6, realPrecision) + 'M';
  } else if (rawNumber >= 1e9 && rawNumber < 1e12) {
    result = round(rawNumber / 1e9, realPrecision) + 'B';
  } else if (rawNumber >= 1e12) {
    result = round(rawNumber / 1e12, realPrecision) + 'T';
  } else {
    result = round(rawNumber, realPrecision);
  }

  return result;
}
