import { ForestNewsKey } from '@/shared/const';
import { useAxios, useGlobalStore, useOtherIndex, useResize } from '@/shared/hooks';
import { isEmpty, STANDARD_SCREEN } from '@/shared/utils';
import classNames from 'classnames';
import type { NextPage } from 'next';
import { useEffect } from 'react';
import BoxBottom from './sections/box-bottom';
import BoxTop from './sections/box-top';
import Login from './sections/login';
import MapViewer from './sections/map-viewer';
import MenuMobile from './sections/menu-mobile';
import { httpService } from '@/shared/services';
import { useGlobalConfig } from '@/shared/hooks/use-global-config.hook';
import StealHeader from './sections/steal-header';
import OAuthValidator from './sections/validator';

const Home: NextPage = () => {
  const { token, pageStatus, setState } = useGlobalStore();
  const { initGlobalConfig } = useGlobalConfig();
  const isOtherIndex = useOtherIndex();

  useResize(() => {
    const width = document.body.clientWidth > 780 ? document.body.clientWidth : STANDARD_SCREEN.width / 2;
    const height = (width * STANDARD_SCREEN.height) / STANDARD_SCREEN.width + 100;

    setState({
      clientWidth: width,
      clientHeight: height,
    });
  }, []);

  const { run: queryNews } = useAxios(
    () => {
      return {
        url: '/api/forest/normal/getForestNews',
        method: 'get',
      };
    },
    {
      onSuccess: (res: any, params: any[]) => {
        const { result: list } = res;
        if (isEmpty(list)) {
          setState({ showUnRead: false });
          return;
        }

        const cache = localStorage.getItem(ForestNewsKey) || '';
        if (isEmpty(cache)) {
          setState({ showUnRead: true });
          return;
        }

        const unread = list.some((item: any) => !cache.includes(item.time));
        setState({ showUnRead: unread });
      },
    }
  );

  useEffect(() => {
    if (!token) return;
    queryNews();
  }, [token]);

  useEffect(() => {
    httpService.setToken(token || '');
    if (token) {
      httpService.retry();
    }
  }, [token]);

  useEffect(() => {
    initGlobalConfig();
  }, []);

  const onMapDrawComplete = () => {
    setState({ pageStatus: 'login' });
  };

  return (
    <div className={classNames('mint-forest-root w-full h-[100dvh] flex relative')}>
      <MapViewer onDrawComplete={onMapDrawComplete} />
      <Login />
      {pageStatus === 'complete' && (
        <>
          {!isOtherIndex ? (
            <>
              <BoxTop />
              <BoxBottom />
              <MenuMobile />
              <OAuthValidator />
            </>
          ) : (
            <StealHeader />
          )}
        </>
      )}
    </div>
  );
};

export default Home;
