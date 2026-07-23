import { useOtherIndex, useResize } from '@/projects/mint-forest/hooks';
import { STANDARD_SCREEN } from '@/projects/mint-forest/utils';
import Alert from './components/common/alert.component';
import classNames from 'classnames';
import type { NextPage } from 'next';
import { useEffect } from 'react';
import BoxBottom from './sections/box-bottom';
import BoxTop from './sections/box-top';
import Login from './sections/login';
import MapViewer from './sections/map-viewer';
import MenuMobile from './sections/menu-mobile';
import { useDemoRequest } from './hooks/use-demo-request.hook';
import { useGlobalConfig } from './hooks/use-global-config.hook';
import { useMintForestStore } from './store/use-mint-forest-store';
import { mintForestGateway } from './data/runtime';
import StealHeader from './sections/steal-header';

const Home: NextPage = () => {
  const { hydrated, token, pageStatus, setState, hydrate } = useMintForestStore();
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

  const { run: queryNews } = useDemoRequest<{ content: Array<{ time: string }>; result: Array<{ time: string }> }, []>(
    () => ({
      url: '/api/forest/normal/getForestNews',
      method: 'GET',
      params: { cursor: '' },
    }),
    {
      gateway: mintForestGateway,
      onSuccess: (data) => {
        setState({ showUnRead: data.result.length > 0 });
      },
    },
  );

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);

  useEffect(() => {
    queryNews();
  }, [queryNews]);

  useEffect(() => {
    initGlobalConfig();
  }, [initGlobalConfig]);

  const onMapDrawComplete = () => {
    if (!useMintForestStore.getState().token) setState({ pageStatus: 'login' });
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
            </>
          ) : (
            <StealHeader />
          )}
        </>
      )}
      <Alert />
    </div>
  );
};

export default Home;
