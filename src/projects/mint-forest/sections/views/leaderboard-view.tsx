import LinearSpan from '@/projects/mint-forest/components/common/linear-span.component';
import { SearchSvg } from '@/projects/mint-forest/assets/svg';
import ScrollBox from '@/projects/mint-forest/components/common/scroll-box.component';
import CommonEmpty from '@/projects/mint-forest/components/common/common-empty.component';
import { CSSProperties, FC, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import SearchBox from '../../components/search-box.component';
import Modal from 'react-modal';
import { HttpCode } from '@/projects/mint-forest/types/api';
import { useCurrentUserInfo } from '@/projects/mint-forest/hooks';
import { mintForestGateway } from '../../data/runtime';
import { useDemoRequest } from '../../hooks/use-demo-request.hook';
import RankItem from '../../components/rank-item.component';

interface RankResponse {
  next: string;
  content: {
    wallet: string;
    domain: string;
    mfTotalAmounts: string | number;
    rankPlace: number;
    greenId?: number;
  }[];
}

interface LeaderboardViewInterface {}

const LeaderboardView: FC<LeaderboardViewInterface> = () => {
  const [showModal, setShowModal] = useState(false);
  const searchRootRef = useRef<HTMLDivElement>(null);
  const [searchBoxStyle, setSearchBoxStyle] = useState<CSSProperties>();
  const [data, setData] = useState<RankResponse['content']>([]);
  const [status, setStatus] = useState<HttpCode | 'loading' | undefined>('loading');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const userInfo = useCurrentUserInfo();

  const { run: getRankData } = useDemoRequest<RankResponse, [string | null]>(
    (cursor: string | null) => ({
      url: '/api/forest/normal/getRankData',
      method: 'GET',
      params: {
        cursor,
      },
    }),
    {
      gateway: mintForestGateway,
      onSuccess: (res, [cursor]) => {
        const { content, next } = res;
        const isFirstCall = cursor === null;
        if (isFirstCall && content.length === 0) {
          setStatus(HttpCode.NoData);
          setHasMore(false);
          setIsLoading(false);
          return;
        }

        setData((prevData) => [...prevData, ...content]);
        setNextCursor(next);
        setHasMore(!!next);
        setStatus(HttpCode.Success);
        setIsLoading(false);
      },
      onError: () => {
        setStatus(HttpCode.Error);
        setHasMore(false);
        setIsLoading(false);
      },
    }
  );

  useEffect(() => {
    setStatus('loading');
    getRankData(null);
  }, []);

  const onReachBottom = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setStatus('loading');
    getRankData(nextCursor);
  }, [isLoading, hasMore, nextCursor]);

  const onMenuClick = () => {
    if (!searchRootRef.current) return;
    setSearchBoxStyle({
      left: searchRootRef.current.offsetLeft,
      top: searchRootRef.current.offsetTop,
    });
    setTimeout(() => {
      setShowModal(true);
    }, 100);
  };

  const onModalClose = () => {
    setShowModal(false);
  };

  return (
    <>
      <Modal
        isOpen={showModal}
        ariaHideApp={false}
        style={{
          overlay: {
            zIndex: 20,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(6px)',
          },
          content: {
            padding: 0,
            border: 'none',
            borderRadius: 0,
            width: 'fit-content',
            height: 'fit-content',
            background: 'rgba(0,0,0,0)',
            overflow: 'hidden',
            ...searchBoxStyle,
          },
        }}
        shouldCloseOnEsc={true}
        shouldCloseOnOverlayClick={true}
        onRequestClose={onModalClose}
      >
        <SearchBox className="!w-[94vw]" autoFocus={true} />
      </Modal>
      <div className="w-[94vw] lg:w-full flex flex-col gap-7">
        <div
          ref={searchRootRef}
          className={
            'mb-only w-full h-21 px-8 rounded-[28px] bg-[#078AD6] flex items-center relative gap-4 cursor-pointer'
          }
          style={{
            boxShadow: '0px -3px 4px 0px rgba(0, 0, 0, 0.25) inset, 0px 2px 4px 0px rgba(255, 255, 255, 0.50) inset',
          }}
          onClick={onMenuClick}
        >
          <SearchSvg className={'w-9 h-9 shrink-0 text-[#86D4FF]'} />
          <span className="bg-transparent relative z-10 text-lg font-semibold text-[#86D4FF]">Search Forest ID</span>
        </div>
        <div
          className="w-full h-[74dvh] lg:w-full lg:h-[86dvh] bg-background-lv1 rounded-[20px] lg:rounded-[40px] p-10 flex flex-col items-start"
          style={{ boxShadow: '0px 2px 4px 0px rgba(255, 255, 255, 0.50) inset, 0px -4px 2px 0px #215994 inset' }}
        >
          <LinearSpan
            className="pc-only text-[28px] leading-[36px] font-bold relative"
            style={{
              background: 'linear-gradient(180deg, #FFF 0%, #FFCC2F 100%)',
              filter: 'drop-shadow(0px 1px 2px #073F7A)',
            }}
          >
            Leaderboard
          </LinearSpan>
          <ScrollBox
            className="w-full h-full flex flex-col gap-6 overflow-auto no-scrollbar pt-10"
            onReachBottom={onReachBottom}
          >
            {userInfo && userInfo.rankVO && <RankItem item={userInfo.rankVO} type="mine" />}
            <div
              className="h-[1px] w-full bg-[#94E79E] shrink-0 my-4"
              style={{
                boxShadow: '0px 1px 0px 0px #AFEF8E',
              }}
            ></div>
            {data.map((item, index) => {
              return <RankItem key={index} item={item} type="common" />;
            })}
            <CommonEmpty data={data} status={status} />
          </ScrollBox>
        </div>
      </div>
    </>
  );
};

export default LeaderboardView;
