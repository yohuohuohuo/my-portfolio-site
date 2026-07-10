import { useCallback, useMemo } from 'react';
import { getScaleObject, getScaleValue } from '../utils';
import { useMintForestStore } from '@/projects/mint-forest/store/use-mint-forest-store';

export const useScaleValue = () => {
  const { clientWidth } = useMintForestStore();

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
