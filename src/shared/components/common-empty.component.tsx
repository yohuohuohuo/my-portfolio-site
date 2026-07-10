/* eslint-disable @next/next/no-img-element */
import { MintSmalllogoSvg } from '@/shared/svg';
import { FC } from 'react';
import { isEmpty } from '@/shared/utils';
import LoadMore from './loadmore/loadmore.component';
import { HttpCode } from '../const';

interface CommonEmptyInterface {
  status?: HttpCode | 'loading';
  className?: string;
  data?: any;
  msg?: string;
}

const CommonEmpty: FC<CommonEmptyInterface> = (props) => {
  if (props.status === 'loading') {
    return (
      <div className={`w-full p-10 flex flex-col items-center justify-center ${props.className}`}>
        <LoadMore />
      </div>
    );
  }

  if (props.status && props.status !== HttpCode.Success && isEmpty(props.data)) {
    return (
      <div className={`w-full p-11 flex items-center justify-center gap-4 text-[#B9D8BB] ${props.className}`}>
        <MintSmalllogoSvg className={'w-8 h-8'} />
        {props.msg ? (
          <span className="text-base font-semibold">{props.msg}</span>
        ) : (
          <span className="text-base font-semibold">
            {props.status === HttpCode.NoData ? 'No results found.' : 'Failed to fetch data.'}
          </span>
        )}
      </div>
    );
  }

  return <></>;
};

export default CommonEmpty;
