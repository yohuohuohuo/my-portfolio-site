import CommonImg from '@/projects/mint-forest/components/common/common-img.component';
import { useCurrentUserInfo, useMobile } from '@/projects/mint-forest/hooks';
import { ellipsis, isEmpty } from '@/projects/mint-forest/utils';
import Avatar from 'boring-avatars';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { FC, useMemo } from 'react';

interface RankItemInterface {
  item: any;
  type: 'common' | 'mine' | 'search';
}

const RankItem: FC<RankItemInterface> = ({ item, type }) => {
  const userInfo = useCurrentUserInfo();
  const { push } = useRouter();
  const { isMobile } = useMobile();

  const itemConfig = useMemo(() => {
    if (isEmpty(item)) return null;

    switch (item.rankPlace) {
      case 1:
        return {
          rank: <CommonImg local src="/projects/mint-forest/images/pic-gold.png" alt="Gold Medal" className="w-20" />,
          bg: {
            background: 'linear-gradient(180deg, #FFFFD6 0%, #FFDA6B 100%)',
            boxShadow: '0px -2px 4px 0px #E89B05 inset, 0px 3px 3px 0px rgba(0, 0, 0, 0.25)',
          },
          amountClass: 'text-[#957800]',
        };
      case 2:
        return {
          rank: <CommonImg local src="/projects/mint-forest/images/pic-silver.png" alt="Silver Medal" className="w-20" />,
          bg: {
            background: 'linear-gradient(180deg, #D6FEFF 0%, #6BFFAE 100%)',
            boxShadow: '0px -2px 4px 0px #19CE92 inset, 0px 3px 3px 0px rgba(0, 0, 0, 0.25)',
          },
          amountClass: '!text-[#009D51]',
        };
      case 3:
        return {
          rank: <CommonImg local src="/projects/mint-forest/images/pic-bronze.png" alt="Bronze Medal" className="w-20" />,
          bg: {
            background: 'linear-gradient(180deg, #FFD6BD 0%, #FFAE73 100%)',
            boxShadow: '0px -2px 4px 0px #E47929 inset, 0px 3px 3px 0px rgba(0, 0, 0, 0.25)',
          },
          amountClass: 'text-[#973E00]',
        };
      default:
        return {
          rank: (
            <span
              className={classNames('text-[#0A3253] font-bold', {
                'text-[18px]': String(item.rankPlace).length <= 5,
                'text-[14px]': String(item.rankPlace).length > 5,
              })}
            >
              {item.rankPlace}
            </span>
          ),
          bg: {
            background:
              'linear-gradient(0deg, rgba(255, 255, 255, 0.00) 0%, rgba(255, 255, 255, 0.00) 100%), linear-gradient(0deg, #FFE76F 0%, #FFFDB9 100%)',
            boxShadow: '0px -6px 4px 0px rgba(36, 72, 92, 0.16) inset, 0px 3px 3px 0px rgba(0, 0, 0, 0.25)',
          },
          amountClass: 'text-[#A18900]',
        };
    }
  }, [item]);

  if (isEmpty(item) || !itemConfig) {
    return <></>;
  }

  return (
    <div
      data-testid={type === 'search' && item.greenId ? `search-result-${item.greenId}` : undefined}
      className={classNames(
        'w-full rounded-[12px] h-30 shrink-0 flex items-center justify-between cursor-pointer'
      )}
      onClick={() => {
        item.greenId && item.greenId !== userInfo?.greenId && push(`/mint-forest?id=${item.greenId}`);
      }}
      style={
        type !== 'mine'
          ? itemConfig.bg
          : {
              background: 'linear-gradient(0deg, #80FF45 0%, #FFDD95 100%)',
              boxShadow: '0px -2px 4px 0px rgba(36, 72, 92, 0.16) inset, 0px 3px 3px 0px rgba(0, 0, 0, 0.25)',
            }
      }
    >
      <div className="flex items-center h-full flex-1 overflow-hidden">
        {itemConfig.rank && (
          <div
            className={classNames('w-32 h-full flex justify-center items-center')}
            style={{
              background: 'rgba(0, 58, 106, 0.10)',
            }}
          >
            {itemConfig.rank}
          </div>
        )}
        <div
          className={classNames('w-16 h-16 rounded-full overflow-hidden mr-4 shrink-0 lg:ml-12 ml-5', {
            'lg:!ml-5': type == 'search',
          })}
        >
          <Avatar
            size={32}
            name={item.domain || item.wallet}
            variant="beam"
            square={false}
            colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
          />
        </div>
        <p className="flex flex-col text-[#3A5B6E] font-bold text-[14px] truncate mr-2">
          {ellipsis(item.domain || item.wallet, 5, isMobile || type === 'search' ? 5 : 42)}
          {item.greenId && <span className="text-[12px] text-[#CEA27A] font-semibold">ID:{item.greenId}</span>}
        </p>
      </div>
      <div className="flex items-center">
        <p
          className={classNames('text-[24px] lg:pr-18 pr-5 font-DINCond', itemConfig.amountClass, {
            'lg:!pr-5': type == 'search',
          })}
        >
          {item.mfTotalAmounts}
        </p>
      </div>
    </div>
  );
};

export default RankItem;
