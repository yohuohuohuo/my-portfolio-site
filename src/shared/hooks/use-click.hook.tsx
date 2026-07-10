import { RefObject, useEffect } from 'react';
import { fromEvent } from 'rxjs';

export const useClick = (
  callback: Function,
  elementRefList: RefObject<Element | undefined | null>[],
  deps?: Array<any>
) => {
  useEffect(() => {
    const event$ = fromEvent(document, 'click').subscribe((e: any) => {
      if (!elementRefList) return;
      const path = e.path || (e.composedPath && e.composedPath());
      let clickedElement = path.find((item: any) => elementRefList.find((ref) => ref.current === item));
      callback(clickedElement != null && clickedElement != undefined);
    });

    return () => {
      event$.unsubscribe();
    };
  }, deps);
};
