import { useCallback, useMemo } from 'react';
import { getScaleObject, getScaleValue } from '../utils';
import { useGlobalStore } from './use-global-store.hook';

export const useScaleValue = () => {
  const { clientWidth } = useGlobalStore();

  return useCallback(
    (value: number, min?: number, max?: number) => {
      if (!clientWidth) return 0;
      return getScaleValue(clientWidth, value, min, max);
    },
    [clientWidth]
  );
};

export function useScaleObj<T>(obj: T, defaultVal?: number): T {
  const getScaleValue = useScaleValue();
  return useMemo(() => {
    return getScaleObject(obj, defaultVal || 0, getScaleValue);
  }, [defaultVal, getScaleValue, obj]);
}
