/* eslint-disable @next/next/no-img-element */
import LoadMore from '@/shared/components/loadmore/loadmore.component';
import { shouldMintChain } from '@/shared/const';
import {
  useAlert,
  useAxios,
  useClientAccount,
  useCurrentUserInfo,
  useGlobalStore,
  useScaleValue,
} from '@/shared/hooks';
import { useGlobalConfig } from '@/shared/hooks/use-global-config.hook';
import { etherSvc } from '@/shared/services/ethers.service';
import {
  BubbleSvg,
  CloseSvg,
  MintSmalllogoSvg,
  SpinBaseSvg,
  SpinPointerSvg,
  SpinSvg,
  SpinTitleSvg,
} from '@/shared/svg';
import { formatNumber, isEmpty } from '@/shared/utils';
import classNames from 'classnames';
import { FC, useEffect, useMemo, useState } from 'react';
import Modal from 'react-modal';
import { useSwitchChain } from 'wagmi';
import { useShallow } from 'zustand/react/shallow';

interface SpinBoxInterface {}
const lightCount = 6;
// const energyRange = [20000, 8000, 2000, 500, 100, 50];
const SpinConfig = {
  w: 552,
  h: 374,
  spinBox: {
    w: 0.5489,
    top: 0.04,
    left: 0.233,
  },
  spin: 0.9057,
  pointer: 0.1866,
};

const SpinBox: FC<SpinBoxInterface> = (props) => {
  const currentUser = useCurrentUserInfo();
  const { updateUserInfo } = useGlobalStore();
  const {
    totalStealLimit: maxSpin,
    turntableConfig,
    turntableSpent,
  } = useGlobalConfig(
    useShallow((state) => ({
      totalStealLimit: state.totalStealLimit,
      turntableConfig: state.turntableConfig,
      turntableSpent: state.turntableSpent,
    }))
  );
  const scaleValue = useScaleValue();
  const alert = useAlert();
  const [spinConfig, setSpinConfig] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [reward, setReward] = useState(0);
  const [rotateInfo, setRotateInfo] = useState({
    rotate: 0,
    duration: 0,
    start: false,
  });
  const { chainId } = useClientAccount();
  const { switchChainAsync } = useSwitchChain();

  const energyRange = useMemo(() => {
    if (!turntableConfig) return [];
    return turntableConfig.map((item) => Number(item.amount)).reverse();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const rootEl = typeof document !== 'undefined' ? document.querySelector('#spin-root') : null;

      const parentW = rootEl ? rootEl.clientWidth : 0;

      const minW = parentW * 1.25;

      const minH = (374 / 552) * minW;

      const w = parentW < 700 ? scaleValue(SpinConfig.w, minW, 552) : SpinConfig.w;
      const h = parentW < 700 ? scaleValue(SpinConfig.h, minH, 374) : SpinConfig.h;

      setSpinConfig({
        w: w,
        h: h,
        spinBox: {
          top: SpinConfig.spinBox.top * h,
          left: SpinConfig.spinBox.left * w,
          w: SpinConfig.spinBox.w * w,
        },
        spin: SpinConfig.spin * w,
        pointer: SpinConfig.pointer * w,
      });
    }, 0);
  }, [scaleValue]);

  const { run: getSpinGift } = useAxios(
    (name: string) => {
      return {
        url: '/api/forest/normal/openTurntable',
        method: 'get',
        params: { name },
      };
    },
    {
      onSuccess: async (data: any) => {
        if (isEmpty(data)) return;
        const { success, msg } = await etherSvc.turntable(data.signature, data.turntableId, data.times);
        if (!success) {
          alert.error(msg);
          setLoading(false);
        } else {
          start(data);
        }
      },
      onError: (e: any) => {
        alert.error(e.msg);
        setLoading(false);
      },
    }
  );

  const onSpinPointerClick = async () => {
    if (loading) return;

    if (currentUser?.turntableTimes == maxSpin) {
      alert.warning(`You can't spin anymore today`);
      return;
    }

    setLoading(true);

    if (chainId !== shouldMintChain().id) {
      switchChainAsync({ chainId: shouldMintChain().id }).finally(() => {
        setLoading(false);
      });
      return;
    }
    getSpinGift();
  };

  const start = (data: any) => {
    const amount = Number(data.amount);
    const gift = energyRange.findIndex((item) => item == amount);

    setRotateInfo((current) => {
      return {
        rotate: current.rotate + 360 * 8 - (360 / 6) * (5 - gift) - (current.rotate % 360),
        duration: 4000,
        start: true,
      };
    });

    setTimeout(() => {
      setRotateInfo((current) => {
        return { ...current, start: false };
      });
      setReward(amount);

      if (currentUser && turntableSpent) {
        updateUserInfo({
          ...currentUser,
          mfTotalAmounts: String(Number(currentUser.mfTotalAmounts) + (amount - turntableSpent)),
          turntableTimes: Number(data.times),
        });
      }

      setLoading(false);
    }, 5000);
  };

  const onRewardClose = () => {
    setReward(0);
  };

  if (!currentUser) {
    return <></>;
  }

  return (
    <>
      <div
        id="spin-root"
        className="w-full h-[460px] lg:h-[507px] flex-shrink-0 relative bg-cover !bg-center rounded-t-[26px] lg:rounded-2xl bg-no-repeat bg-[url(https://static.mintchain.io/forest/pic-spin-bg-mobile.png)] lg:bg-[url(https://static.mintchain.io/forest/pic-spin-bg.png)]"
      >
        <div className="w-full mt-2 lg:mt-5 flex flex-col items-center">
          <SpinTitleSvg className={'w-[68%] lg:w-[380px] h-31'} />
          <span className="text-[32px] font-extrabold text-white lg:text-primary -mt-6">
            {currentUser.turntableTimes}/{maxSpin}
          </span>
        </div>
        {currentUser && (
          <div className="absolute left-[50%] translate-x-[-50%] lg:translate-x-[unset] -bottom-20 z-20 lg:left-14 lg:bottom-14 flex flex-col items-center lg:items-start">
            <span className="text-white lg:text-[#0D5D00] text-md">MF Pool</span>
            <span className="text-white lg:text-[#0D5D00] text-[32px] leading-[32px] lg:leading-[40px] font-DINCond font-medium lg:font-bold">
              {formatNumber(currentUser.mfTotalAmounts)} MF
            </span>
          </div>
        )}
        {spinConfig && (
          <div
            className="absolute left-[50%] translate-x-[-50%] -bottom-2"
            style={{
              width: spinConfig.w,
              height: spinConfig.h,
            }}
          >
            <SpinBaseSvg className={'w-full h-full'} />
            <div
              className="rounded-full bg-[rgba(0,0,0,0)] absolute flex justify-center items-center"
              style={{
                width: spinConfig.spinBox.w,
                height: spinConfig.spinBox.w,
                left: spinConfig.spinBox.left,
                top: spinConfig.spinBox.top,
              }}
            >
              <SpinSvg
                className={'absolute left-[50%] translate-x-[-50%] transition-all'}
                style={{
                  transitionDuration: `${rotateInfo.duration}ms`,
                  transform: `translateX(-50%) rotate(${rotateInfo.rotate}deg)`,
                  width: spinConfig.spin,
                  height: spinConfig.spin,
                }}
              />

              <div
                className={classNames('relative cursor-pointer select-none transition-all origin-center group', {
                  '!cursor-not-allowed': loading || currentUser.turntableTimes == maxSpin,
                })}
                onClick={onSpinPointerClick}
                style={{
                  width: spinConfig.pointer,
                  height: spinConfig.pointer,
                }}
              >
                <SpinPointerSvg
                  className={'relative z-20 w-full h-full select-none group-active:scale-105 lg:group-hover:scale-105'}
                />
                {loading ? (
                  <div className="absolute-center z-[60]">
                    <LoadMore />
                  </div>
                ) : (
                  <span
                    className={classNames(
                      'absolute left-[50%] translate-x-[-50%] top-[50%] select-none translate-y-[-50%] z-40 text-[28px] font-DINCond text-[#D2872B]',
                      {
                        '!text-[#C7C7C3]': currentUser.turntableTimes == maxSpin,
                      }
                    )}
                  >
                    {turntableSpent}
                  </span>
                )}
              </div>

              {new Array(lightCount).fill('0').map((item, index) => {
                return (
                  <div
                    key={index}
                    className="w-full h-[7px] absolute px-[1.75%] flex justify-between items-center"
                    style={{
                      transform: `rotate(${(index * 180) / lightCount}deg)`,
                    }}
                  >
                    <div
                      className={classNames('w-[7px] h-full rounded-full', {
                        'bg-[#FFF50A] drop-shadow-[0px_0px_16.3px_#FFB800]': index % 2 === 0,
                        'bg-[#FFFFFF] drop-shadow-[0px_0px_16.3px_#FFFFFF]': index % 2 !== 0,
                        'spin-light-anim': rotateInfo.start,
                      })}
                      style={{
                        animationDirection: index % 2 ? 'normal' : 'reverse',
                      }}
                    />
                    <div
                      className={classNames('w-[7px] h-full rounded-full', {
                        'bg-[#FFF50A] drop-shadow-[0px_0px_16.3px_#FFB800]': index % 2 === 0,
                        'bg-[#FFFFFF] drop-shadow-[0px_0px_16.3px_#FFFFFF]': index % 2 !== 0,
                        'spin-light-anim': rotateInfo.start,
                      })}
                      style={{
                        animationDirection: index % 2 ? 'normal' : 'reverse',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <Modal
        isOpen={reward > 0}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        ariaHideApp={false}
        onRequestClose={onRewardClose}
        style={{
          overlay: {
            zIndex: 100000,
            background: 'rgba(0,0,0,0.5)',
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
      >
        <div
          className={classNames(
            'w-[80vw] lg:w-[380px] bg-gradient-to-b from-[#C3EEE9] to-[#FEFADE] rounded-xl flex flex-col items-center mx-auto py-16 px-20 mt-[20vh] relative'
          )}
        >
          <span className="text-[24px] font-bold text-primary mb-6">MF Lucky Spin</span>
          <span className="text-md text-[#00A637] font-normal mb-30">
            Congratulations on winning {formatNumber(reward) + ' MF'}
          </span>

          <div className="flex items-center gap-4">
            <div className="w-23 h-23 rounded-full relative text-[#1B831F] flex items-center justify-center shadow-lg">
              <BubbleSvg className="w-full h-full absolute left-0 top-0 z-10" />
              <img
                className="w-full h-full absolute left-0 top-0 z-20"
                src={'https://static.mintchain.io/forest/ic-bubble-light.png'}
                alt=""
              />
              <MintSmalllogoSvg className={'w-11 h-11 relative z-30'} />
            </div>
            <span className="text-primary font-bold text-[28px]">+{formatNumber(reward)} MF</span>
          </div>
          <span
            className="w-[200px] h-18 leading-[36px] text-center rounded-lg bg-[#0CDC50] hover:bg-[#09A63D] text-black text-md font-medium mt-10 cursor-pointer"
            onClick={onRewardClose}
          >
            close
          </span>
          <div
            className="text-black w-24 h-24 flex items-center justify-center absolute right-0 top-0 cursor-pointer"
            onClick={onRewardClose}
          >
            <CloseSvg className={'w-14 h-14'} />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SpinBox;
