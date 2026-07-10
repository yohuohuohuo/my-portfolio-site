import ScrollBox from '@/shared/components/scroll-box.component';
import CommonEmpty from '@/shared/components/common-empty.component';
import CommonImg from '@/shared/components/common-img.component';
import LoadMore from '@/shared/components/loadmore/loadmore.component';
import { FC, useEffect, useState, useCallback } from 'react';
import { HttpCode } from '@/shared/const';
import OpenBoxModal from '../../components/openbox-modal.component';
import { useAlert, useGlobalStore } from '@/shared/hooks';
import moment from 'moment';
import { isEmpty } from '@/shared/utils';
import { GreenIdStatusEnum } from '@/shared/interfaces';
import { mintForestGateway } from '../../data/runtime';
import { useDemoRequest } from '../../hooks/use-demo-request.hook';
import { useMintForestStore } from '../../store/use-mint-forest-store';

interface NFTItem {
  contract: string;
  name: string;
  id: string;
  image: string;
}

interface BoxItem {
  boxId: number;
  name: string;
  date: string;
  boxNumber: number;
}

interface BoxResponse {
  next: string;
  content: {
    wallet: string;
    boxNumber: number;
    boxId: number;
    name: string;
    speedAmount: string;
    status: number;
    createTime: string;
    openTime: string;
    signature: string;
  }[];
}

interface NftResponse {
  next: string;
  content: {
    nftUniqueNum: string;
    contract: string;
    tokenId: string;
    name: string;
    logo: string;
    speedAmount: string;
  }[];
}

interface OpenBoxResponse {
  wallet: string;
  boxNumber: number;
  boxId: number;
  name: string;
  speedAmount: string;
  status: number;
  createTime: string;
  openTime: string;
  signature: string;
}

const BoxImg: any = { 1: '/projects/mint-forest/images/pic-signin-box.png', 4: '/projects/mint-forest/images/pix-event-box.png' };

interface BackPackViewInterface {}

const BackPackView: FC<BackPackViewInterface> = () => {
  const { userInfo } = useGlobalStore();
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [boxes, setBoxes] = useState<BoxItem[]>([]);
  const [nftStatus, setNftStatus] = useState<HttpCode | 'loading' | undefined>('loading');
  const [boxStatus, setBoxStatus] = useState<HttpCode | 'loading' | undefined>('loading');
  const [loadingBoxIndex, setLoadingBoxIndex] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reward, setReward] = useState<string | null>(null);
  const [nextBoxCursor, setNextBoxCursor] = useState<string | null>(null);
  const [nextNftCursor, setNextNftCursor] = useState<string | null>(null);
  const [hasMoreBoxes, setHasMoreBoxes] = useState(true);
  const [hasMoreNfts, setHasMoreNfts] = useState(true);
  const [isLoadingBoxes, setIsLoadingBoxes] = useState(false);
  const [isLoadingNfts, setIsLoadingNfts] = useState(false);
  const alert = useAlert();

  const { run: openBox } = useDemoRequest<OpenBoxResponse, [number]>(
    (boxNumber: number) => ({
      url: '/api/forest/normal/openBoxData',
      method: 'GET',
      params: { boxNumber },
    }),
    {
      gateway: mintForestGateway,
      onSuccess: (res) => {
        setReward(res.speedAmount);
        useMintForestStore.getState().syncFromRepository();
        setModalVisible(true);
        const remainingBoxes = boxes.filter((box) => box.boxNumber !== res.boxNumber);
        setBoxes(remainingBoxes);
        if (!remainingBoxes.length) setBoxStatus(HttpCode.NoData);
        setLoadingBoxIndex(null);
      },
      onError: (error) => {
        alert.error(error.msg || 'Failed to open box');
        setLoadingBoxIndex(null);
      },
    }
  );

  const { run: getBoxData } = useDemoRequest<BoxResponse, [string | null]>(
    (cursor: string | null) => ({
      url: '/api/forest/normal/getBoxData',
      method: 'GET',
      params: {
        status: 0,
        cursor,
      },
    }),
    {
      gateway: mintForestGateway,
      onSuccess: (res, [cursor]) => {
        const { content, next } = res;

        if (content.length === 0 && cursor === null) {
          setBoxStatus(HttpCode.NoData);
          setHasMoreBoxes(false);
          setIsLoadingBoxes(false);
          return;
        }

        const newBoxes: BoxItem[] = content.map((item) => ({
          boxId: item.boxId,
          name: item.name,
          date: moment(item.createTime).format('YYYY-MM-DD'),
          boxNumber: item.boxNumber,
        }));

        setBoxes((prevBoxes) => [...prevBoxes, ...newBoxes]);
        setNextBoxCursor(next);
        setHasMoreBoxes(!!next);
        setBoxStatus(HttpCode.Success);
        setIsLoadingBoxes(false);
      },
      onError: () => {
        setBoxStatus(HttpCode.Error);
        setHasMoreBoxes(false);
        setIsLoadingBoxes(false);
      },
    }
  );

  const { run: getNftData } = useDemoRequest<NftResponse, [string | null]>(
    (cursor: string | null) => ({
      url: '/api/forest/normal/getMyNft',
      method: 'GET',
      params: {
        cursor,
      },
    }),
    {
      gateway: mintForestGateway,
      onSuccess: (res, [cursor]) => {
        const { content, next } = res;

        const currentList = isEmpty(content) ? [] : content;
        if (!cursor && userInfo && userInfo.greenIdStatus != 0) {
          const filterGreenId = currentList.filter((item) => item.name && item.name.includes('GreenID'));
          if (isEmpty(filterGreenId)) {
            currentList.unshift({
              nftUniqueNum: '',
              contract: 'demo-contract',
              tokenId: userInfo.greenId + '',
              name: `GreenID#${userInfo.greenId}`,
              speedAmount: '',
              logo: '/projects/mint-forest/images/nft/greenid-demo.png',
            });
          }
        }

        if (isEmpty(currentList) && cursor === null) {
          setNftStatus(HttpCode.NoData);
          setHasMoreNfts(false);
          setIsLoadingNfts(false);
          return;
        }

        const newNfts: NFTItem[] = currentList.map((item) => ({
          ...item,
          name: item.name,
          id: item.tokenId,
          image: item.logo,
        }));

        if (!cursor) {
          setNfts(newNfts);
        } else {
          setNfts((prevNfts) => [...prevNfts, ...newNfts]);
        }
        setNextNftCursor(next);
        setHasMoreNfts(!!next);
        setNftStatus(HttpCode.Success);
        setIsLoadingNfts(false);
      },
      onError: () => {
        setNftStatus(HttpCode.Error);
        setHasMoreNfts(false);
        setIsLoadingNfts(false);
      },
    }
  );

  useEffect(() => {
    setBoxStatus('loading');
    setNftStatus('loading');
    getBoxData(null);
    getNftData(null);
  }, []);

  const onReachBottom = useCallback(() => {
    if (!isLoadingNfts && hasMoreNfts) {
      setIsLoadingNfts(true);
      setNftStatus('loading');
      getNftData(nextNftCursor);
      return;
    }

    if (!isLoadingBoxes && hasMoreBoxes) {
      setIsLoadingBoxes(true);
      setBoxStatus('loading');
      getBoxData(nextBoxCursor);
    }
  }, [isLoadingNfts, hasMoreNfts, nextNftCursor, isLoadingBoxes, hasMoreBoxes, nextBoxCursor]);

  const handleOpenBox = (box: BoxItem, index: number) => {
    if (loadingBoxIndex) return;
    setLoadingBoxIndex(index);

    openBox(box.boxNumber);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setReward(null);
  };

  return (
    <>
      <div
        className="w-full h-[80dvh] lg:h-[75dvh] bg-background-lv1 rounded-[40px] p-10"
        style={{
          boxShadow: '0px 2px 4px 0px rgba(255, 255, 255, 0.50) inset, 0px -4px 2px 0px #215994 inset',
        }}
      >
        <div
          className="w-full h-full bg-[#FFEFBE] rounded-[24px] px-10 py-12"
          style={{
            boxShadow:
              '0px 4px 2px 0px #FFF inset, 0px 3px 6px 0px rgba(0, 0, 0, 0.30), 0px -4px 2px 0px #DEAE7B inset',
          }}
        >
          <ScrollBox className="w-full h-full overflow-auto no-scrollbar" onReachBottom={onReachBottom}>
            <div className="min-h-0">
              <h2 className="text-[#A45118] text-xl font-bold mb-4">My NFT</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 lg:gap-8 gap-4">
                {nfts.length > 0 &&
                  nfts.map((nft) => (
                    <div key={nft.id} className="bg-white rounded-[8px] p-4 border border-[#DAE1D2]">
                      <div className="w-full aspect-square">
                        <img src={nft.image} alt={nft.name} className="w-full h-full rounded-[6px] object-contain" />
                      </div>
                      <div className="flex flex-col mt-4 gap-2">
                        <p className="text-[#000] text-[14px] font-semibold leading-normal">{nft.name}</p>
                        <p className="text-[#999681] text-[12px] leading-normal">#{nft.id}</p>
                      </div>
                    </div>
                  ))}
              </div>
              <CommonEmpty data={nfts} status={nftStatus} />
            </div>
            <div className="min-h-0 mt-8">
              <h2 className="text-[#A45118] text-xl font-bold mb-4">My Box</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 lg:gap-8 gap-4">
                {boxes.length > 0 &&
                  boxes.map((box, index) => (
                    <div
                      data-testid={`box-${box.boxNumber}`}
                      key={box.boxNumber}
                      className="bg-white rounded-[8px] p-4 cursor-pointer relative border border-[#DAE1D2]"
                      onClick={() => handleOpenBox(box, index)}
                    >
                      <div
                        className="w-full aspect-square relative flex justify-center items-center"
                        style={{
                          background: 'linear-gradient(180deg, #129A53 0%, #9CE974 100%)',
                        }}
                      >
                        {loadingBoxIndex === index && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-[6px]">
                            <LoadMore />
                          </div>
                        )}
                        <CommonImg
                          src={BoxImg[box.boxId]}
                          local
                          alt={box.name}
                          className="w-3/4 rounded-[6px] object-contain"
                        />
                      </div>
                      <div className="flex flex-col mt-4 gap-2">
                        <p className="text-[#000] text-[14px] font-semibold leading-normal">{box.name}</p>
                        <p className="text-[#999681] text-[12px] leading-normal">{box.date}</p>
                      </div>
                    </div>
                  ))}
              </div>
              <CommonEmpty data={boxes} status={boxStatus} />
            </div>
          </ScrollBox>
        </div>
      </div>
      <OpenBoxModal reward={reward ? parseFloat(reward) : 0} isOpen={modalVisible} onRequestClose={handleCloseModal} />
    </>
  );
};

export default BackPackView;
