import { useCallback } from 'react';

export const usePreloadImg = () => {
  const loadAsync = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        resolve(img);
      };
      img.onerror = (err) => {
        reject(err);
      };
    });
  }, []);

  return useCallback(async (srcList: string[]) => {
    const loadList: Promise<HTMLImageElement>[] = [];
    srcList.forEach((item) => {
      loadList.push(loadAsync(item));
    });
    return await Promise.all(loadList);
  }, []);
};
