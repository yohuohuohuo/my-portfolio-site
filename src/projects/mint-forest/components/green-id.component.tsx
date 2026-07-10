import CommonButton from '@/shared/components/common-button.component';
import CommonImg from '@/shared/components/common-img.component';
import { GreenIdAddress, shouldMintChain } from '@/shared/const';
import { useAlert, useCheckWallet, useCurrentUserInfo, useMobile, usePreloadImg } from '@/shared/hooks';
import { GreenIdStatusEnum } from '@/shared/interfaces';
import { etherSvc } from '@/shared/services/ethers.service';
import { NotifyEvent, notifyService } from '@/shared/services/notify.service';
import { CloseSvg } from '@/shared/svg';
import { setTimeoutPlus } from '@/shared/utils';
import classNames from 'classnames';
import { CSSProperties, FC, useCallback, useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { UAParser } from 'ua-parser-js';
import { useSwitchChain } from 'wagmi';

interface GreenIdInterface {}

enum Step {
  init = 0,
  showModal = 1,
  showModalContent = 2,
  showAddition = 3,
  showBt = 4,
}

const GreenId: FC<GreenIdInterface> = (props) => {
  const currentUser = useCurrentUserInfo();
  const alert = useAlert();
  const { switchChainAsync } = useSwitchChain();
  const { valid } = useCheckWallet(shouldMintChain().id);

  const [showStep, setShowStep] = useState<Step>(Step.init);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [cardRoate, setCardRoate] = useState<CSSProperties>();
  const [canScale, setCanScale] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const [nftImg, setNftImg] = useState('');
  const [boost, setBoost] = useState('');
  const [greenIdStatus, setGreenIdStatus] = useState(GreenIdStatusEnum.NoGreenId);

  const cloneElement = useRef<any>(null);
  const { isMobile } = useMobile();
  const preload = usePreloadImg();

  const show = () => {
    if (!currentUser) return;
    document.documentElement.style.overflow = 'hidden';

    setShowStep(Step.showModal);

    setTimeoutPlus([
      {
        ms: 200,
        callback: () => {
          setShowStep(Step.showModalContent);

          if (greenIdStatus == GreenIdStatusEnum.Actived) {
            showCard();
          } else {
            setCardRoate({
              transform: `rotateY(720deg) scale(1)`,
            });
          }
        },
      },
      {
        ms: 300,
        callback: () => {
          setShowStep(Step.showAddition);
        },
      },
      {
        ms: 300,
        callback: () => {
          setShowStep(Step.showBt);
        },
      },
    ]);
  };

  const close = () => {
    document.documentElement.style.overflow = 'auto';

    setShowStep(Step.init);
    setCardRoate({ transform: 'rotateY(0deg) scale(0)' });

    if (currentUser && greenIdStatus == GreenIdStatusEnum.Actived) {
      hideCard();
    }
  };

  const claim = async () => {
    if (claimLoading || !currentUser) return;
    setClaimLoading(true);
    try {
      const { success, msg } = await etherSvc.claimGreenId(currentUser.greenId);
      if (success) {
        const url = '/projects/mint-forest/images/nft/greenid-demo.png';
        await preload([url]);
        setNftImg(url);
        setClaimSuccess(true);
        setCardRoate({ transform: 'rotateY(540deg) scale(1)' });
        setBoost(currentUser.greenIdSpeedAmounts);
        setGreenIdStatus(GreenIdStatusEnum.Actived);

        setTimeout(() => {
          notifyService.notify(NotifyEvent.USER_INFO_REFRESH);
        }, 6000);
      } else {
        alert.error(msg);
      }
    } catch (error: any) {
      console.log(error);
    }
    setClaimLoading(false);
  };

  const onChangeNetworkClick = async () => {
    if (!switchChainAsync) return;
    setNetworkLoading(true);
    switchChainAsync({ chainId: shouldMintChain().id }).finally(() => {
      setNetworkLoading(false);
    });
  };

  useEffect(() => {
    setCardRoate({ transform: 'rotateY(0deg) scale(0)' });
  }, []);

  useEffect(() => {
    return () => {
      const appRoot = document.querySelector('#app-root');
      if (appRoot && cloneElement.current) {
        try {
          appRoot.removeChild(cloneElement.current);
        } catch (error) {
          console.log(error);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    switch (currentUser.greenIdStatus) {
      case 0:
        setGreenIdStatus(GreenIdStatusEnum.NoGreenId);
        break;
      case 1:
        setGreenIdStatus(GreenIdStatusEnum.NotActive);
        break;
      case 11:
        setGreenIdStatus(GreenIdStatusEnum.Actived);
        break;
      default:
        setGreenIdStatus(GreenIdStatusEnum.NoGreenId);
        break;
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    if (greenIdStatus == GreenIdStatusEnum.Actived) {
      setNftImg('/projects/mint-forest/images/nft/greenid-demo.png');
      if (currentUser.greenIdSpeedAmounts) {
        setBoost(currentUser.greenIdSpeedAmounts);
      }
    } else {
      setNftImg('/projects/mint-forest/images/nft/notactive.png');
    }
  }, [greenIdStatus, currentUser]);

  const showCard = useCallback(() => {
    const smallEl: HTMLImageElement | null = document.querySelector('#green-id-small');
    const cardEl = document.querySelector('#green-id-card');
    const appRoot = document.querySelector('#app-root');

    if (!cardEl || !smallEl || !appRoot || !currentUser) {
      return;
    }
    cloneElement.current = smallEl.cloneNode(true);
    cloneElement.current.id = '#green-id-large';

    smallEl.classList.add('opacity-0');

    cardMove({
      startRect: smallEl.getBoundingClientRect(),
      targetRect: cardEl.getBoundingClientRect(),
      cloneElement: cloneElement.current,
      appRoot,
    });
  }, [canScale]);

  const hideCard = useCallback(() => {
    const smallEl = document.querySelector('#green-id-small');
    const cardEl = document.querySelector('#green-id-card');
    const appRoot = document.querySelector('#app-root');

    if (!cardEl || !smallEl || !appRoot || !cloneElement.current) {
      return;
    }

    cardMove({
      startRect: cardEl.getBoundingClientRect(),
      targetRect: smallEl.getBoundingClientRect(),
      cloneElement: cloneElement.current,
      appRoot,
      moveEnd: () => {
        appRoot.removeChild(cloneElement.current);
        smallEl.classList.remove('opacity-0');
      },
    });
  }, [canScale]);

  const getScaleStatus = useCallback(() => {
    if (typeof document === 'undefined') return false;
    const parser = new UAParser();
    if (parser.getBrowser().name === 'Safari') return false;
    if (isMobile && ['Mac OS', 'iOS'].includes(parser.getOS().name || '')) {
      return false;
    }
    return true;
  }, [isMobile]);

  useEffect(() => {
    setCanScale(getScaleStatus());
  }, [getScaleStatus]);

  const cardMove = ({
    startRect,
    targetRect,
    cloneElement,
    appRoot,
    moveEnd,
  }: {
    startRect: DOMRect;
    targetRect: DOMRect;
    cloneElement: any;
    appRoot: Element;
    moveEnd?: () => void;
  }) => {
    cloneElement.classList.remove('-translate-x-1/2');

    cloneElement.style = {};
    cloneElement.style.position = 'absolute';
    cloneElement.style.zIndex = 99999;
    cloneElement.style.left = `${startRect.x}px`;
    cloneElement.style.top = `${startRect.y + window.scrollY}px`;
    cloneElement.style.width = `${startRect.width}px`;
    cloneElement.style.height = `${startRect.height}px`;
    appRoot.appendChild(cloneElement);

    setTimeout(() => {
      if (!canScale) {
        cloneElement.style.width = `${targetRect.width}px`;
        cloneElement.style.height = `${targetRect.height}px`;
        cloneElement.style.left = `${targetRect.x}px`;
        cloneElement.style.top = `${targetRect.y}px`;
      } else {
        const translateX = targetRect.x - startRect.x;
        const translateY = targetRect.y - startRect.y;
        const scaleX = targetRect.width / startRect.width;
        const scaleY = targetRect.height / startRect.height;
        cloneElement.style.transformOrigin = '0 0';
        cloneElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
      }
    }, 100);

    setTimeout(() => {
      moveEnd && moveEnd();
    }, 600);
  };

  useEffect(() => {
    if (greenIdStatus == GreenIdStatusEnum.NoGreenId) return;

    const notify = notifyService.subscribe([
      {
        name: NotifyEvent.SHOW_GREENID,
        callback: () => {
          show();
        },
      },
    ]);

    return () => {
      notify.unsubscribe();
    };
  }, []);

  if (!currentUser || greenIdStatus == GreenIdStatusEnum.NoGreenId) {
    return <></>;
  }

  return (
    <>
      {greenIdStatus == GreenIdStatusEnum.Actived ? (
        <>
          <div className="relative mb-12 lg:mb-14 lg:ml-10" onClick={show}>
            <div className="w-30 h-30 lg:w-40 lg:h-40 rounded-circle bg-gradient-to-b from-[#00721C] to-[#00FF29] border-[3px] border-white"></div>
            <span
              style={{ boxShadow: '0px 4px 7.5px 0px rgba(0, 0, 0, 0.25)' }}
              className="block text-sm lg:text-xl font-semibold text-[#14651D] h-10 leading-[18px] lg:h-15 lg:leading-[26px] px-4 lg:px-6 bg-[#D0F4DE] border-2 border-[#6DF1B2] rounded-tr-[8px] rounded-bl-[8px] lg:rounded-tr-[16px] lg:rounded-bl-[16px] absolute bottom-[-14px] left-1/2 -translate-x-1/2"
            >
              GreenID
            </span>
            <CommonImg
              local
              id="green-id-small"
              className={classNames(
                'w-20 lg:w-22 absolute bottom-5 lg:bottom-[22px] left-1/2 -translate-x-1/2 will-change-transform ease-in-out duration-300',
                canScale ? 'transition-transform' : 'transition-size-positon'
              )}
              src={nftImg}
            />
          </div>
        </>
      ) : (
        <>
          <div className="relative mb-12 lg:mb-8 lg:ml-2">
            <div className="w-[70%] h-[70%] green-id-box-light-anim absolute left-[50%] -translate-x-1/2 top-[50%] translate-y-[-50%] z-0"></div>
            <CommonImg
              className="w-auto h-[50px] lg:h-[70px] relative z-10 cursor-pointer"
              src={'/forest/ic-box.png'}
              alt="green id box"
              onClick={show}
            />
          </div>
        </>
      )}

      {currentUser && (
        <Modal
          isOpen={showStep > Step.init}
          shouldCloseOnOverlayClick={true}
          shouldCloseOnEsc={true}
          ariaHideApp={false}
          onRequestClose={close}
          style={{
            overlay: {
              zIndex: 99,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(6px)',
            },
            content: {
              padding: 0,
              background: 'none',
              border: 'none',
              width: '100%',
              height: '100%',
              inset: '0',
              borderRadius: 0,
            },
          }}
          className={'flex items-center justify-center'}
        >
          <div className="flex flex-col items-center justify-center w-[336px] h-[666px] lg:w-[380px] lg:h-[754px] relative">
            {showStep >= Step.showBt && (
              <div
                className="text-white w-16 h-16 flex items-center justify-center absolute right-[-12px] top-[60px] lg:right-[-50px] lg:top-[100px] cursor-pointer z-50 rounded-full border border-white"
                onClick={close}
              >
                <CloseSvg />
              </div>
            )}

            <div
              id="green-id-card"
              className="w-[280px] h-[460px] lg:w-[320px] lg:h-[526px]"
              style={{
                perspective: '800px',
                perspectiveOrigin: '50% 50%',
              }}
            >
              <div
                className={classNames('w-full h-full relative transition-all duration-[2000ms] z-10 ease-in-out', {
                  '!duration-[1200ms]': greenIdStatus == GreenIdStatusEnum.Actived && claimSuccess,
                })}
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  ...cardRoate,
                }}
              >
                <div
                  className={classNames('w-full h-full absolute left-0 top-0 rounded-[36px] z-0')}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {greenIdStatus == GreenIdStatusEnum.Actived ? (
                    <CommonImg local className="w-full h-full relative z-10" src={nftImg} alt="green id nft claimed" />
                  ) : (
                    <CommonImg
                      local
                      className="w-full h-full relative z-10"
                      src={'/projects/mint-forest/images/nft/notactive.png'}
                      alt="green id nft not active"
                    />
                  )}
                </div>
                <CommonImg
                  local
                  className="w-full h-full relative z-10"
                  src={greenIdStatus == GreenIdStatusEnum.Actived ? nftImg : '/projects/mint-forest/images/nft/notactive.png'}
                  alt="green id box"
                  style={{
                    backfaceVisibility: 'hidden',
                  }}
                />
              </div>
            </div>
            <div
              className={classNames(
                'absolute left-1/2 -translate-x-1/2 bottom-[0] flex flex-col items-center gap-[20px] z-20'
              )}
            >
              {boost && (
                <span
                  className={classNames(
                    'text-[20px] leading-[28px] font-medium text-white break-keep whitespace-nowrap transition-all duration-1000',
                    {
                      'opacity-0 scale-0': showStep < Step.showAddition,
                      'opacity-100 scale-100': showStep >= Step.showAddition,
                    }
                  )}
                >
                  GreenID Boost: {`${(Number(boost) * 100).toFixed(1)}%`}
                </span>
              )}
              {greenIdStatus == GreenIdStatusEnum.Actived ? (
                <CommonButton
                  className={classNames(
                    'min-w-[147px] h-22 rounded-xl px-12 flex items-center justify-center gap-5 transition-all duration-1000',
                    showStep >= Step.showBt ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  )}
                  loading={false}
                  style={{
                    background: 'linear-gradient(180deg, #0CDC50 0%, #D7FF35 100%)',
                    boxShadow: '0px 0px 24px 0px #11E055',
                  }}
                  onClick={() => {
                    window.open(`https://mint.nftscan.com/${GreenIdAddress}/${currentUser.greenId}`);
                  }}
                >
                  <CommonImg local className="w-13 h-auto" src="/projects/mint-forest/images/nftscan-icon.png" alt="nftscan logo" />
                  <span className="text-base text-black text-nowrap">View on NFTScan</span>
                </CommonButton>
              ) : (
                <>
                  {!valid ? (
                    <CommonButton
                      className={classNames(
                        'min-w-[147px] h-22 rounded-xl px-12 flex items-center justify-center gap-5 transition-all duration-1000 text-base text-black',
                        showStep >= Step.showBt ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                      )}
                      loading={networkLoading}
                      onClick={onChangeNetworkClick}
                    >
                      Change Network
                    </CommonButton>
                  ) : (
                    <CommonButton
                      className={classNames(
                        'min-w-[147px] h-22 rounded-xl px-12 flex items-center justify-center gap-5 transition-all duration-1000 text-base text-black',
                        showStep >= Step.showBt ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                      )}
                      loading={claimLoading}
                      onClick={claim}
                    >
                      Activate it
                    </CommonButton>
                  )}
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default GreenId;
