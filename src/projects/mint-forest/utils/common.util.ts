import path from 'path';

export function isServer() {
  return typeof window === 'undefined';
}

export function isEmpty(value: unknown): value is undefined | null {
  if (value === undefined || value == null || value === 'null' || value === 'undefined') {
    return true;
  }

  if (typeof value === 'number' || typeof value === 'function') {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  if (typeof value === 'string') {
    return value.length === 0;
  }

  return false;
}

export function formatDuring(mss: number) {
  let days = parseInt((mss / (1000 * 60 * 60 * 24)).toString());
  let hours = parseInt(((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString());
  let minutes = parseInt(((mss % (1000 * 60 * 60)) / (1000 * 60)).toString());
  let seconds = parseInt(((mss % (1000 * 60)) / 1000).toString());
  let millisecond = parseInt((mss % 1000).toString());
  return [days, hours, minutes, seconds, millisecond];
}

export function toNumber(value: any): number {
  if (!value) return 0;

  if (typeof value == 'string' && value.includes('%')) {
    return Number(value.split('%')[0]) / 100;
  }

  return isNaN(value) ? 0 : Number(value);
}

export const getStaticFilePath = (file: string) => {
  const publicDir = path.join(process.cwd(), 'public');
  return path.join(publicDir, file);
};
