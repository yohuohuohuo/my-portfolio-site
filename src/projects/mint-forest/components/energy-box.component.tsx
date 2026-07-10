/* eslint-disable @next/next/no-img-element */
import CommonImg from '@/shared/components/common-img.component';
import CommonModal from '@/shared/components/common-modal.component';
import NumberCount from '@/shared/components/number-count';
import { useCurrentLevel, useCurrentUserInfo } from '@/shared/hooks';
import { useGlobalConfig } from '@/shared/hooks/use-global-config.hook';
import { ArrowSvg } from '@/shared/svg';
import { formatNumber } from '@/shared/utils';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { FC, useEffect, useMemo, useState } from 'react';
import ActivityView from '../sections/views/activity-view';

interface EnergyBoxInterface {}

const EnergyBox: FC<EnergyBoxInterface> = (props) => {
  const lvConfig = useGlobalConfig((state) => state.levelConfig);
  const currentUser = useCurrentUserInfo();
  const [progress, setProgress] = useState(-1);
  const {
    query: { id },
  } = useRouter();

  const currentLevel = useCurrentLevel();

  useEffect(() => {
    setProgress(-1);
  }, [id]);

  const [showModal, setShowModal] = useState(false);

  const onMenuClick = () => {
    setShowModal(true);
  };

  const onModalClose = () => {
    setShowModal(false);
  };

  const levelInfo = useMemo(() => {
    if (!currentUser || !lvConfig) return null;

    const topLevelEnergy = lvConfig[lvConfig.length - 1];
    const total = Number(currentUser.mfTotalAmounts);
    const lastLevelEnergy = lvConfig[currentLevel - 2] || 0;

    return {
      currentLvEnergy: total > topLevelEnergy ? topLevelEnergy : total - lastLevelEnergy,
      nextLvEnergy: total > topLevelEnergy ? topLevelEnergy : lvConfig[currentLevel - 1] - lastLevelEnergy,
    };
  }, [lvConfig, currentUser, currentLevel]);

  useEffect(() => {
    if (!currentUser || !levelInfo) {
      return;
    }

    setProgress((levelInfo.currentLvEnergy / levelInfo.nextLvEnergy) * 100);
  }, [currentUser, levelInfo]);

  if (!currentUser) {
    return;
  }

  return (
    <>
      <CommonModal show={showModal} onClose={onModalClose}>
        <ActivityView />
      </CommonModal>
      <div className="flex flex-col items-start">
        <div className="flex items-center mb-4 gap-4 lg:gap-8">
          <div
            id="energy-container"
            className="h-15 px-4 lg:h-22 lg:px-7 rounded-[30px] border-2 border-[#FFFDB7] flex items-center gap-3 lg:gap-5 text-[#14651D] cursor-pointer"
            style={{
              background: 'linear-gradient(180deg, #5BE632 0%, #26D424 100%)',
              boxShadow: '0px 2px 3px 0px rgba(255, 255, 255, 0.64) inset, 0px -2px 5.8px 0px #057B00 inset',
            }}
            onClick={onMenuClick}
          >
            <CommonImg local className="w-10 lg:w-14" src={'/projects/mint-forest/images/ic-mf.png'} alt="" />
            <span className="text-lg lg:text-xl font-medium font-DINCond">
              <NumberCount className={'font-[inherit]'} number={Number(currentUser.mfTotalAmounts)} /> MF
            </span>
            <ArrowSvg className={'w-9 h-6 lg:w-12 lg:h-8'} />
          </div>
          <span
            className="text-text-lv1 text-sm font-bold h-15 leading-[30px] rounded-3xl px-6"
            style={{
              background: 'linear-gradient(180deg, #FEEACE 0%, #EEC694 100%)',
              boxShadow: '0px -2px 1px 0px #B5714A inset',
            }}
          >
            LV.{currentLevel}
          </span>
          <span
            className="text-text-lv1 text-sm font-bold h-15 leading-[30px] rounded-3xl px-6"
            style={{
              background: 'linear-gradient(180deg, #FEEACE 0%, #EEC694 100%)',
              boxShadow: '0px -2px 1px 0px #B5714A inset',
            }}
          >
            ID.{currentUser.greenId}
          </span>
        </div>
        <div
          className="w-[276px] h-12 lg:w-[434px] lg:h-17 rounded-[20px] border border-[#C76500] overflow-hidden p-[3px] lg:p-2"
          style={{
            filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
            background: 'linear-gradient(180deg, #FFE2A8 0%, #FF8812 100%)',
          }}
        >
          <div
            className="w-full h-full rounded-[20px] border border-[#C76500] p-1 overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #482400 11.75%, #7E3E03 66.39%, #9E560B 105.75%)',
            }}
          >
            <div className="w-full h-full relative rounded-[18px] overflow-hidden">
              <div
                className={classNames('w-full h-full relative rounded-[18px] bg-no-repeat', {
                  'transition-all duration-1000': progress >= 0,
                })}
                style={{
                  right: `${100 - progress}%`,
                  background: 'url(/projects/mint-forest/images/pic-active-progress.svg)',
                  backgroundSize: '100% 100%',
                  backgroundRepeat: 'no-repeat',
                }}
              ></div>
            </div>
          </div>
        </div>
        {levelInfo && (
          <>
            <span
              className={classNames('text-sm text-black mt-4', {
                invisible: levelInfo.nextLvEnergy - levelInfo.currentLvEnergy <= 0,
              })}
            >
              Only{' '}
              <span className="text-[#A45118]">
                {formatNumber(levelInfo.nextLvEnergy - levelInfo.currentLvEnergy)}MF
              </span>{' '}
              left to unlock the next area
            </span>
          </>
        )}
      </div>
    </>
  );
};

export default EnergyBox;
