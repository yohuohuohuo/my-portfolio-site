/* eslint-disable @next/next/no-img-element */
import CountDown from '@/projects/mint-forest/components/common/count-down.component';
import LoadMore from '@/projects/mint-forest/components/common/loadmore/loadmore.component';
import { useAlert, useOtherIndex } from '@/projects/mint-forest/hooks';
import { useGlobalConfig } from '@/projects/mint-forest/hooks/use-global-config.hook';
import { isEmpty } from '@/projects/mint-forest/utils';
import classNames from 'classnames';
import moment from 'moment';
import Image from 'next/image';
import { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import { mintForestGateway } from '../data/runtime';
import { useMintForestStore } from '../store/use-mint-forest-store';
import BubbleRobot from './bubble-robot.component';
import { clone } from 'lodash';

interface BubbleData {
  style: CSSProperties;
  data: any;
}

interface BubbleInterface {
  itemData: BubbleData;
}

const Bubble: FC<BubbleInterface> = (props) => {
  const [itemData, setItemData] = useState<BubbleData | undefined>();
  const totalStealLimit = useGlobalConfig((state) => state.totalStealLimit);
  const { otherUserInfo, userInfo } = useMintForestStore();
  const alert = useAlert();
  const isOtherIndex = useOtherIndex();

  const [collectedStatus, setCollectedStatus] = useState<'initial' | 'scale' | 'done'>('initial');
  const [countDate, setCountDate] = useState<Array<number>>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItemData(props.itemData);
  }, [props.itemData]);

  const collect = async () => {
    if (!itemData || itemData.data.freeze || loading) {
      return;
    }
    setLoading(true);

    if (itemData.data.type === 'daily') {
      dailyClaim();
      return;
    }

    if (isOtherIndex) {
      stealClaim();
    } else {
      inviteClaim();
    }
  };

  useEffect(() => {
    if (!itemData || !itemData.data) return;

    setCollectedStatus('initial');

    let endDate = null;
    if (['daily', '48h', 'steal'].includes(itemData.data.type)) {
      endDate = moment().utc().endOf('day');
    }

    if (itemData.data.type === '24h') {
      endDate = moment().utc().add(1, 'day').endOf('day');
    }

    if (!endDate) return;

    setCountDate([new Date().getTime(), Number(endDate.format('x'))]);
  }, [itemData]);

  const inviteClaim = async () => {
    if (!userInfo || !itemData || !itemData.data) return;
    const amount = Number(userInfo.mfInviteAmounts);
    const { success, msg } = await mintForestGateway.claimInvite();
    setLoading(false);
    if (!success) {
      alert.error(msg);
    } else {
      showAnimation();
      useMintForestStore.getState().syncFromRepository();
      alert.energyToast('collect', amount);
    }
  };

  const dailyClaim = async () => {
    if (!userInfo || !itemData || !itemData.data) return;
    const amount = Number(userInfo.mfDailyAmounts);
    const { success, msg } = await mintForestGateway.claimDaily();
    setLoading(false);
    if (!success) {
      alert.error(msg);
    } else {
      showAnimation();

      useMintForestStore.getState().syncFromRepository();
      alert.energyToast('collect', amount);
    }
  };

  const stealClaim = async () => {
    if (!otherUserInfo || !userInfo || !totalStealLimit || !itemData || !itemData.data) return;

    const amount = Number(otherUserInfo.canStolenAmounts);

    const { success, msg } = await mintForestGateway.steal(String(otherUserInfo.greenId));
    setLoading(false);
    if (!success) {
      alert.error(msg);
      setCollectedStatus('initial');
    } else {
      // showAnimation();
      setCollectedStatus('done');

      alert.energyToast('collect', amount);

      useMintForestStore.getState().syncFromRepository();

      if (userInfo.stealTimes == totalStealLimit - 1) {
        setTimeout(() => {
          alert.warning(`Collect up to ${totalStealLimit} times others' MF daily.`);
        }, 3000);
      }
    }
  };

  const showAnimation = () => {
    if (!itemData || !itemData.data) return;

    const appRoot = document.querySelector('#app-root');
    const injectRoot = document.querySelector('#energy-container');
    const bubbleRoot = document.querySelector(`#bubble-root-${itemData.data.id}`);
    if (!bubbleRoot || !appRoot || !injectRoot) return;
    setCollectedStatus('scale');

    const bubbleRect = bubbleRoot.getBoundingClientRect();
    const injectRect = injectRoot.getBoundingClientRect();

    const cloneElement: any = bubbleRoot.cloneNode(true);
    cloneElement.classList.remove('bubble-wave');
    cloneElement.classList.add('transition-all');
    cloneElement.classList.add('duration-700');

    cloneElement.style.left = `${bubbleRect.x}px`;
    cloneElement.style.top = `${bubbleRect.y + window.scrollY}px`;
    cloneElement.style.width = `${bubbleRect.width}px`;
    cloneElement.style.height = `${bubbleRect.height}px`;
    cloneElement.style.zIndex = 9999;

    appRoot.appendChild(cloneElement);

    setTimeout(() => {
      cloneElement.style.left = `${injectRect.x + injectRect.width / 2 - bubbleRect.width / 2}px`;
      cloneElement.style.top = `${injectRect.y + window.scrollY + injectRect.height / 2 - bubbleRect.height / 2}px`;
    }, 100);

    setTimeout(() => {
      cloneElement.style.transform = 'scale(0.2)';
    }, 300);

    setTimeout(() => {
      cloneElement.style.transform = 'scale(0)';
      appRoot.removeChild(cloneElement);
      setCollectedStatus('done');

      if (itemData.data.type !== 'steal') {
        setTimeout(() => {
          setCollectedStatus('initial');
          setItemData((current) => {
            const next = clone(current);
            if (next) {
              next.data.freeze = true;
            }
            return next;
          });
        }, 2000);
      }
    }, 750);
  };

  const bubbleType: 'normal' | 'gold' | 'gold-disable' | null = useMemo(() => {
    if (isEmpty(itemData) || isEmpty(itemData.data)) return null;

    if (['steal', 'daily'].includes(itemData.data.type)) {
      if (itemData.data.freeze) {
        return 'gold-disable';
      } else {
        return 'gold';
      }
    }
    return 'normal';
  }, [itemData]);

  if (!itemData || !itemData.data || collectedStatus !== 'initial') {
    return <></>;
  }

  return (
    <div
      data-testid={`bubble-${itemData.data.type}`}
      id={`bubble-root-${itemData.data.id}`}
      className={classNames(
        'absolute flex items-center justify-center cursor-pointer max-h-[68px] max-w-[68px] z-[1000] select-none bubble-wave',
        {
          'text-[rgba(20,101,29,1)]': bubbleType === 'gold' || bubbleType === 'normal',
          'text-[rgba(20,101,29,0.6)]': bubbleType === 'gold-disable',
        }
      )}
      style={itemData.style}
      onClick={collect}
    >
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center z-40 bg-[rgba(255,255,255,0.4)] rounded-full">
          <LoadMore />
        </div>
      ) : null}

      {bubbleType === 'normal' ? (
        <>
          <BubbleRobot
            className="w-full h-full !absolute left-0 top-0 z-10"
            count={10}
            amount={itemData.data.amount}
            collecting={itemData.data.freeze}
          />
        </>
      ) : (
        <>
          {/* {bubbleType === 'gold' && <BubbleGoldSvg className="w-full h-full absolute left-0 top-0 z-10" />}
          {bubbleType === 'gold-disable' && (
            <BubbleGoldDisableSvg className="w-full h-full absolute left-0 top-0 z-10" />
          )} */}
          <div
            className={classNames(
              'w-full h-full absolute left-0 top-0 z-10 rounded-full',
              bubbleType === 'gold' ? 'bg-[rgba(67,245,70,1)]' : 'bg-[rgba(67,245,70,0.6)]'
            )}
          ></div>
          <img
            className="w-full h-full absolute left-0 top-0 z-20"
            src={'/projects/mint-forest/images/ic-bubble-light.png'}
            alt=""
          />
          <span
            className={classNames('font-DINCond font-medium relative z-30', {
              'text-[22px] lg:text-[28px]': String(itemData.data.amount).length <= 5,
              'text-[14px] lg:text-[20px]': String(itemData.data.amount).length > 5,
            })}
          >
            {itemData.data.amount}
          </span>
          {countDate && (
            <span className="text-sm lg:text-base font-semibold absolute -bottom-8 lg:-bottom-12 translate-x-[-50%] left-[50%]">
              <CountDown type="short" start={countDate[0]} end={countDate[1]} duration={1000} />
            </span>
          )}
        </>
      )}

      {itemData.data.stealable && !itemData.data.freeze && (
        <div className="flex items-center gap-2 absolute -bottom-18 lg:-bottom-22 translate-x-[-50%] left-[50%]">
          <span className="text-sm text-[#BD751F] font-semibold text-nowrap overflow-visible">
            {isOtherIndex ? 'Collectable' : 'Can be collected'}
          </span>
          <Image src="/projects/mint-forest/images/steal-hand.png" width={15} height={19} alt={''} />
        </div>
      )}
    </div>
  );
};

export default Bubble;
