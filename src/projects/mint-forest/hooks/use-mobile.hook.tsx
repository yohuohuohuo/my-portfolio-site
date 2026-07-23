import { useCallback, useEffect, useState } from 'react';
import { fromEvent } from 'rxjs';

const ScreenConfig = {
  mobile: 912,
  pad: 1024,
};

type ScreenType = 'PC' | 'PAD' | 'MOBILE';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [screen, setScreen] = useState<ScreenType>('PC');

  const checkIsScreen = useCallback((width: number) => {
    if (typeof document === 'undefined') return false;
    const w = document.documentElement.clientWidth || document.body.clientWidth;
    return w <= width;
  }, []);

  const getCurrentScreen = (): ScreenType => {
    if (typeof document === 'undefined') return 'PC';
    const w = document.documentElement.clientWidth || document.body.clientWidth;
    if (w <= ScreenConfig.mobile) {
      return 'MOBILE';
    } else if (w > ScreenConfig.mobile && w <= ScreenConfig.pad) {
      return 'PAD';
    } else {
      return 'PC';
    }
  };

  useEffect(() => {
    setIsMobile(checkIsScreen(ScreenConfig.mobile));
    setScreen(getCurrentScreen());

    const resize$ = fromEvent(window, 'resize').subscribe((e: any) => {
      setIsMobile(checkIsScreen(ScreenConfig.mobile));
      setScreen(getCurrentScreen());
    });

    return () => {
      resize$.unsubscribe();
    };
  }, []);

  return { isMobile, screen, checkIsScreen };
};
