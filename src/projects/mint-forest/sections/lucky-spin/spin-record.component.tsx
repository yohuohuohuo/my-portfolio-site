import CommonEmpty from '@/shared/components/common-empty.component';
import { HttpCode } from '@/shared/const';
import { useGlobalStore, useMobile, useReachBottom } from '@/shared/hooks';
import { useAxios } from '@/shared/hooks/axios.hook';
import { isEmpty } from '@/shared/utils';
import moment from 'moment';
import { FC, useEffect, useRef, useState } from 'react';

interface SpinRecordInterface {}

const SpinRecord: FC<SpinRecordInterface> = (props) => {
  const [list, setList] = useState<any[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useMobile();
  const { userInfo } = useGlobalStore();
  const cursor = useRef('');
  const [status, setStatus] = useState<HttpCode>();

  const { run: queryHistory, status: queryStatus } = useAxios(
    (cursor: string) => {
      return {
        url: '/api/forest/normal/getUserActivity',
        method: 'get',
        params: { cursor, txType: 10 },
      };
    },
    {
      onSuccess: (data: any, params: any[]) => {
        if (isEmpty(data)) {
          return;
        }
        const { content, next } = data;

        if (isEmpty(content) && !cursor.current) {
          setStatus(HttpCode.NoData);
          return;
        }

        setList((current) => {
          return !cursor.current ? content : [...(current || []), ...content];
        });

        cursor.current = next;
      },
      onError: () => {
        cursor.current = '';
      },
    }
  );

  useEffect(() => {
    queryHistory(cursor.current);
  }, []);

  useEffect(() => {
    if (userInfo?.turntableTimes) {
      cursor.current = '';
      queryHistory(cursor.current);
    }
  }, [userInfo?.turntableTimes]);

  useReachBottom(
    () => {
      if (!cursor.current) {
        return;
      }
      queryHistory(cursor.current);
    },
    isMobile ? '#lucky-spin-content' : listRef,
    [isMobile]
  );

  return (
    <div className="flex-[2] flex flex-col bg-white rounded-2xl relative overflow-hidden">
      <div className="w-full h-[400px] bg-leaderboard-bg absolute left-0 top-0 z-0 rounded-t-md"></div>
      <span className="w-full h-21 leading-[42px] px-14 bg-[#BBFF72] text-md text-[#1F4E00] font-semibold relative z-10 mb-8">
        History Record
      </span>
      <div ref={listRef} className="lg:h-[500px] overflow-auto relative z-10 flex flex-col px-14 pb-4 gap-6">
        {list.map((item, index) => {
          return (
            <div key={index} className="w-full flex justify-between ">
              <span className="text-black text-base">{moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
              <span className="text-primary text-[20px] font-DINCond">+{item.amount}MF</span>
            </div>
          );
        })}
        <CommonEmpty status={status || queryStatus} data={list} />
      </div>
    </div>
  );
};

export default SpinRecord;
