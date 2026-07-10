/* eslint-disable react-hooks/exhaustive-deps */
import { RefObject, useEffect, useRef } from 'react';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { isEmpty } from '../utils';

export interface ScrollCallbackData {
  element: HTMLElement;
  scrollHeight: number;
  scrollTop: number;
  clientHeight: number;
  direction: 'down' | 'up';
}

export const useScroll = (
  callback: (e: ScrollCallbackData) => void,
  elementRef?: RefObject<HTMLElement | null> | string | Window,
  deps?: Array<any>,
  debounce?: number
) => {
  const subscription$ = useRef<any>(null);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    let element = null;
    if (typeof elementRef === 'string') {
      element = document.querySelector(elementRef);
    } else if (elementRef && Object.prototype.hasOwnProperty.call(elementRef, 'current')) {
      element = (elementRef as any).current;
    } else {
      element = elementRef;
    }

    if (!element) {
      return;
    }

    const observable = fromEvent(element as any, 'scroll');

    const currentDebounce = isEmpty(debounce) ? 100 : debounce;
    if (currentDebounce != 0) {
      observable.pipe(debounceTime(currentDebounce));
    }

    subscription$.current = observable.subscribe((e: any) => {
      let currentTarget = element !== window ? e.target : document.documentElement || document.body;

      let scrollHeight = currentTarget.scrollHeight;
      let clientHeight = currentTarget.clientHeight;
      let scrollTop = currentTarget.scrollTop;

      if (element === window && !scrollTop) {
        scrollTop = window.scrollY;
      }

      const scrollDirection = scrollTop > lastScrollTop.current ? 'down' : 'up';
      lastScrollTop.current = scrollTop;

      callback({
        element: currentTarget,
        scrollHeight,
        scrollTop,
        clientHeight,
        direction: scrollDirection,
      });
    });

    return () => {
      subscription$.current?.unsubscribe();
      subscription$.current = null;
    };
  }, [callback, debounce, ...(deps || [])]);
};
