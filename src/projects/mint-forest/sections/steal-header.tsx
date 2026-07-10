import CommonImg from '@/shared/components/common-img.component';
import { useGlobalStore } from '@/shared/hooks';
import { useGlobalConfig } from '@/shared/hooks/use-global-config.hook';
import { Arrow2Svg } from '@/shared/svg';
import { formatNumber } from '@/shared/utils';
import Avatar from 'boring-avatars';
import Link from 'next/link';
import { FC } from 'react';
import { useShallow } from 'zustand/react/shallow';

interface StealHeaderInterface {}

const StealHeader: FC<StealHeaderInterface> = (props) => {
  const { otherUserInfo, userInfo, setState } = useGlobalStore(
    useShallow((state) => ({ otherUserInfo: state.otherUserInfo, userInfo: state.userInfo, setState: state.setState }))
  );
  const totalStealLimit = useGlobalConfig(useShallow((state) => state.totalStealLimit));

  const onBackClick = () => {
    setState({ otherUserInfo: undefined });
  };

  if (!otherUserInfo || !userInfo) {
    return <></>;
  }

  return (
    <div data-testid="other-forest-header" className="w-[94vw] h-20 lg:w-[68%] absolute left-1/2 -translate-x-1/2 top-[50px] lg:top-[98px]">
      <Link
        href={'/mint-forest'}
        replace
        className="w-20 h-20 border-[4px] bg-[#48D348] rounded-md absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center text-white hover:brightness-105 hover:text-white"
        onClick={onBackClick}
      >
        <Arrow2Svg className={'w-[20px] h-[12px] rotate-90'} />
      </Link>
      <div className="w-fit flex items-center justify-between min-w-[170px] h-20 rounded-[50px] border-2 border-white bg-[#F4FAF7] gap-11 relative absolute-center">
        <span className="text-lg font-semibold text-black pl-[64px]">Forest ID {otherUserInfo.greenId} · LV.{otherUserInfo.level}</span>
        <span className="text-lg font-semibold text-black text-primary pr-8">
          {formatNumber(otherUserInfo.mfTotalAmounts)}
        </span>
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 border-[4px] border-white rounded-full">
          <Avatar
            size={46}
            name={otherUserInfo.wallet}
            variant="beam"
            square={false}
            colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
          />
        </div>
      </div>
      <div className="absolute left-0 bottom-[-100px] z-50 flex flex-col gap-1">
        <span className="text-primary text-[18px] font-semibold">
          {userInfo.stealTimes}/{totalStealLimit}
        </span>
        <div className="flex items-center justify-center bg-[#D0F4DE] border-[2px] border-[#6DF1B2] px-3 rounded-bl-lg rounded-tr-lg shadow-menu-text">
          <span className="text-sm font-semibold text-[#044923] mr-2">Collected</span>
          <CommonImg local src="/projects/mint-forest/images/steal-hand.png" width={15} height={19} alt={''} />
        </div>
      </div>
    </div>
  );
};

export default StealHeader;
