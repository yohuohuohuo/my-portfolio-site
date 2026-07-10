import { useEffect, useRef } from 'react';
import { debounceTime, fromEvent } from 'rxjs';
import { isEmpty } from '../utils';

export const useResize = (callback: Function, deps?: Array<any>, strict?: boolean, debounce?: number) => {
  const subscription$ = useRef<any>(null);

  useEffect(() => {
    if (!strict) {
      callback();
    }
    const observable = fromEvent(window, 'resize');

    const currentDebounce = isEmpty(debounce) ? 100 : debounce;
    if (currentDebounce != 0) {
      observable.pipe(debounceTime(currentDebounce));
    }

    subscription$.current = observable.subscribe((e: any) => {
      callback(e);
    });

    return () => {
      subscription$.current?.unsubscribe();
      subscription$.current = null;
    };
  }, deps || []);
};
