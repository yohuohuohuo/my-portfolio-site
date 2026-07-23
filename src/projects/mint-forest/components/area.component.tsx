import NoSSR from '@/projects/mint-forest/components/common/no-ssr.component';
import { useCurrentLevel, useCurrentUserInfo, useOtherIndex } from '@/projects/mint-forest/hooks';
import { areaToStyle, convertToBubble, generateBubbles, generateClouds, getAreaByLv, isEmpty } from '@/projects/mint-forest/utils';
import { clone } from 'lodash';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import Bubble from './bubble.component';
import Building from './building.component';
import Cloud from './cloud.component';
import { useRouter } from 'next/router';
import { NotifyEvent, notifyService } from '@/projects/mint-forest/services/notify.service';

interface AreaInterface {
  lv: number;
  opend?: boolean;
}

const Area: FC<AreaInterface> = (props) => {
  const { isReady } = useRouter();
  const currentUser = useCurrentUserInfo();
  const isOtherIndex = useOtherIndex();
  const currentLevel = useCurrentLevel();

  const [bubbles, setBubbles] = useState<any[]>([]);
  const existedBubbles = useRef<any[]>([]);

  const updateBubbles = (energys: any[], level: number) => {
    const handledEnergyIDs: string[] = [];
    const energyList = clone(energys);

    const list: any[] = [];
    existedBubbles.current.forEach((bubble: any, bubbleIndex: number) => {
      const energyIndex = energyList.findIndex((energy) => {
        const idStart = `${energy.amount}_`;
        return bubble.id == energy.id || bubble.id?.startsWith(idStart);
      });

      const data = energyList[energyIndex];
      if (data) {
        handledEnergyIDs.push(bubble.id);
        energyList.splice(energyIndex, 1);
        list.push(convertToBubble(bubble, data));
      }
    });

    existedBubbles.current = existedBubbles.current.filter((item) => handledEnergyIDs.includes(item.id));

    const randomBubbles = generateBubbles(level, energyList.length, existedBubbles.current).map((item, index) => {
      list.push(convertToBubble(item, energyList[index]));
      return { ...item, id: energyList[index].id };
    });

    existedBubbles.current = existedBubbles.current.concat(randomBubbles);

    setBubbles(list);
  };

  useEffect(() => {
    if (!currentUser || !props.lv || !isReady || props.lv != currentLevel) {
      setBubbles([]);
      existedBubbles.current = [];
      return;
    }

    const energyList = [];

    if (!isOtherIndex) {
      if (currentUser.infoType === 'mine') {
        energyList.push({
          freeze: currentUser.mfDailyStatus == 1,
          type: 'daily',
          id: `${currentUser.mfDailyAmounts}_daily`,
          amount: currentUser.mfDailyAmounts,
          stealable: false,
        });

        if (currentUser.inviteNumber > 0) {
          energyList.push({
            freeze: currentUser.mfInviteStatus == 1,
            type: '48h',
            id: `${currentUser.mfInviteAmounts}_48h`,
            amount: currentUser.mfInviteAmounts,
            stealable: false,
          });
        }
      }
    } else {
      const canStolenAmounts = Number(currentUser.canStolenAmounts);
      if (canStolenAmounts > 0 && currentUser.stolenStatus != 1) {
        energyList.push({
          freeze: false,
          type: 'steal',
          id: `${currentUser.canStolenAmounts}_steal`,
          amount: canStolenAmounts,
          stealable: canStolenAmounts > 0,
        });
      }
    }

    updateBubbles(energyList, props.lv);
  }, [currentUser, props.lv, isOtherIndex, currentLevel]);

  // useEffect(() => {
  //   if (props.lv != currentLevel) {
  //     return;
  //   }

  //   const notify = notifyService.subscribe([
  //     {
  //       name: NotifyEvent.CLAIM_COMPLETE,
  //       callback: (id: string) => {
  //         let allCliamed = true;
  //         setBubbles((current) => {
  //           const next = current.map((item) => {
  //             item.data.freeze = item.data.id === id ? true : item.data.freeze;
  //             if (!item.data.freeze) {
  //               allCliamed = false;
  //             }
  //             return item;
  //           });
  //           return next;
  //         });

  //         if (allCliamed) {
  //           setTimeout(() => {
  //             notifyService.notify(NotifyEvent.USER_INFO_REFRESH);
  //           }, 5000);
  //         }
  //       },
  //     },
  //   ]);

  //   return () => {
  //     notify.unsubscribe();
  //   };
  // }, [props.lv, currentLevel]);

  const currentArea = useMemo(() => {
    return getAreaByLv(props.lv);
  }, [props.lv]);

  const clouds = useMemo(() => {
    return generateClouds(props.lv);
  }, [props.lv]);

  if (!currentArea) {
    return;
  }

  return (
    <>
      <div key={props.lv} className="absolute" style={areaToStyle(currentArea)}>
        {!currentArea.empty &&
          !isEmpty(bubbles) &&
          bubbles.map((item, index) => {
            return <Bubble key={item.data.id} itemData={item} />;
          })}

        {/* <span className="absolute left-0 top-0 text-[80px] text-red-500 font-black z-[99999]">
        Total: {props.lv} {clouds.length}
      </span> */}

        <div className="w-full h-full absolute-center z-[999] select-none">
          <NoSSR>
            {clouds.map((item, index) => {
              return <Cloud index={index} key={index} item={item} opend={props.opend} totalCount={clouds.length} />;
            })}
          </NoSSR>
        </div>
        <Building currentArea={currentArea} opend={props.opend} lv={props.lv} />
      </div>
    </>
  );
};

export default Area;
