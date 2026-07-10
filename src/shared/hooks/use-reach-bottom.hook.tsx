/* eslint-disable react-hooks/exhaustive-deps */
import { debounce } from 'lodash';
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { ScrollCallbackData, useScroll } from './use-scroll.hook';

export const useReachBottom = (
  callback: Function,
  element?: RefObject<HTMLElement | null> | string | Window,
  deps?: Array<any>,
  distance?: number
) => {
  const lastDistance = useRef<number>(0);
  const lastScrollTop = useRef(0);
  const lastScrollHeight = useRef(0);

  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleCallback = useCallback(
    debounce((distance: number) => {
      callbackRef.current();
      lastScrollTop.current = distance;
    }, 300),
    [callback, ...(deps || [])]
  );

  const scrollCallback = useCallback(
    (e: ScrollCallbackData) => {
      const calledDistance = distance || 200;
      const currentDistance = e.scrollHeight - e.scrollTop - e.clientHeight;

      if (e.scrollHeight < lastScrollHeight.current) {
        lastScrollTop.current = 0;
      }
      lastScrollHeight.current = e.scrollHeight;

      if (currentDistance <= calledDistance && currentDistance < lastDistance.current && e.direction === 'down') {
        handleCallback(e.scrollTop);
      }

      lastDistance.current = currentDistance;
    },
    [distance]
  );

  useScroll(scrollCallback, element, [handleCallback, scrollCallback]);
};
