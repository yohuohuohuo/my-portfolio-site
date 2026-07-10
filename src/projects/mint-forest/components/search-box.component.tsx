import CommonEmpty from '@/projects/mint-forest/components/common/common-empty.component';
import Dropdown from '@/projects/mint-forest/components/common/dropdown.component';
import { useMobile } from '@/projects/mint-forest/hooks';
import type { IUserInfo } from '../types/api';
import { useSearchUser } from '../hooks/use-search-user';
import { SearchSvg } from '@/projects/mint-forest/assets/svg';
import classNames from 'classnames';
import { FC, useCallback, useRef, useState } from 'react';
import RankItem from './rank-item.component';

interface SearchBoxInterface {
  className?: string;
  autoFocus?: boolean;
}

const SearchBox: FC<SearchBoxInterface> = (props) => {
  const { isMobile } = useMobile();
  const [userInfo, setUserInfo] = useState<IUserInfo | undefined>();
  const dropRef = useRef<any>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { run: queryUserInfo, status } = useSearchUser({
    onSuccess: (data: any, params: any[]) => {
      if (inputRef.current?.value != data.greenId) {
        dropRef.current?.hide();
        return;
      }
      if (!data.rankVO) {
        data.rankVO = {
          wallet: data.wallet,
          domain: data.domain,
          mfTotalAmounts: data.mfTotalAmounts,
          rankPlace: null,
          greenId: data.greenId,
        };
      } else {
        data.rankVO = { ...data.rankVO, greenId: data.greenId };
      }
      setUserInfo(data);
      dropRef.current?.show();
    },
    onError: (error: any) => {
      setUserInfo(undefined);
    },
  });

  const searchRequest = useCallback(
    (value: string) => {
      if (!value) return;
      setUserInfo(undefined);
      queryUserInfo(value);
    },
    [queryUserInfo]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keywords = e.target.value || '';

    if (keywords) {
      dropRef.current?.show();
      searchRequest(keywords);
    } else {
      dropRef.current?.hide();
    }
  };

  return (
    <Dropdown
      onRef={dropRef}
      placement={isMobile ? ['bottom'] : ['top']}
      content={() => (
        <>
          {status && (
            <div
              className="w-[94vw] lg:w-[382px] h-50 rounded-[20px] bg-background-lv1 flex items-center justify-center px-5"
              style={{ boxShadow: '0px 2px 4px 0px rgba(255, 255, 255, 0.50) inset, 0px -4px 2px 0px #215994 inset' }}
            >
              <CommonEmpty status={status} data={userInfo} />
              <>{userInfo && <RankItem item={userInfo.rankVO} type="search" />}</>
            </div>
          )}
        </>
      )}
    >
      <div
        ref={searchBoxRef}
        className={classNames(
          'w-[215px] h-21 px-8 rounded-[28px] bg-[#078AD6] flex items-center relative gap-4',
          props.className
        )}
        style={{
          boxShadow: '0px -3px 4px 0px rgba(0, 0, 0, 0.25) inset, 0px 2px 4px 0px rgba(255, 255, 255, 0.50) inset',
        }}
      >
        <SearchSvg className={'w-9 h-9 flex-shrink-0 text-[#86D4FF]'} />

        <div className="flex-1 overflow-hidden">
          <input
            ref={inputRef}
            className="bg-transparent relative z-10 text-white text-lg font-semibold placeholder:text-lg placeholder:text-[#86D4FF]"
            type="text"
            placeholder="Search Forest ID"
            onChange={onChange}
            autoFocus={props.autoFocus}
          />
        </div>
      </div>
    </Dropdown>
  );
};

export default SearchBox;
