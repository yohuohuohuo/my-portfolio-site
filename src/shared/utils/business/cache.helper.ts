import moment from 'moment';
import { isEmpty } from '..';

export const setLocalStorage = (key: string, address: string, value: string) => {
  if (!value || !address) return;
  localStorage.setItem(`${key}_${address}`, value);
};

export const getLocalStorage = (key: string, address: string, defaultValue?: any) => {
  const value = localStorage.getItem(`${key}_${address}`);
  if (isEmpty(value) || !address) {
    return defaultValue;
  }
  return value;
};

export const setExpirationLocalStorage = (key: string, address: string, value: string, expiration: moment.Moment) => {
  if (!value || !address || !expiration) return;

  const current = {
    value,
    expirationTime: expiration.format(),
  };
  localStorage.setItem(`${key}_${address}`, JSON.stringify(current));
};

export const getExpirationLocalStorage = (key: string, address: string, defaultValue?: any) => {
  if (!address) return defaultValue;

  const currentKey = `${key}_${address}`;

  const cache = localStorage.getItem(currentKey);

  if (isEmpty(cache)) {
    return defaultValue;
  }

  const { value, expirationTime } = JSON.parse(cache);

  if (moment().isAfter(moment(expirationTime))) {
    localStorage.removeItem(currentKey);
    return defaultValue;
  }

  return value;
};

export const clearLocalStorage = (key: string, address: string) => {
  localStorage.removeItem(`${key}_${address}`);
};
