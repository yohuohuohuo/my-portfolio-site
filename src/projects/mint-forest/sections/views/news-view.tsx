/* eslint-disable @next/next/no-img-element */
import CommonEmpty from '@/shared/components/common-empty.component';
import ScrollBox from '@/shared/components/scroll-box.component';
import { AuthType, ForestNewsKey, HttpCode } from '@/shared/const';
import { useGlobalStore } from '@/shared/hooks';
import { useAxios } from '@/shared/hooks/axios.hook';
import { isEmpty } from '@/shared/utils';
import moment from 'moment';
import Link from 'next/link';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

interface NewsViewInterface {}

const NewsView: FC<NewsViewInterface> = (props) => {
  const { setState } = useGlobalStore();
  const [list, setList] = useState<any[]>();
  const [status, setStatus] = useState<HttpCode | 'loading' | undefined>();
  const cursor = useRef('');
  const haveMore = useRef(false);

  const { run: queryNews, status: requestStatus } = useAxios(
    (cursor) => {
      return {
        url: '/api/forest/normal/getForestNews',
        method: 'get',
        params: { cursor },
      };
    },
    {
      authType: AuthType.Ignored,
      onSuccess: (data: any, params: any[]) => {
        const { content, next } = data;
        cursor.current = next;
        haveMore.current = !isEmpty(content) && content.length >= 50;

        if (params[0] == 1 && isEmpty(content)) {
          setTimeout(() => {
            setStatus(HttpCode.NoData);
          }, 600);
        }

        setList((current) => {
          return !cursor.current ? content : [...(current || []), ...content];
        });
      },
    }
  );

  useEffect(() => {
    setStatus(requestStatus);
  }, [requestStatus]);

  useEffect(() => {
    queryNews(cursor.current);
  }, []);

  const onReachBottom = useCallback(() => {
    if (!haveMore.current) {
      return;
    }
    queryNews(cursor.current);
  }, []);

  useEffect(() => {
    if (isEmpty(list)) {
      return;
    }

    const oldItems = localStorage.getItem(ForestNewsKey) || '';
    const newsItems = list
      .filter((item) => !oldItems.includes(item.time))
      .map((item) => item.time)
      .join(',');

    localStorage.setItem(ForestNewsKey, [oldItems, newsItems].filter((item) => !isEmpty(item)).join(','));

    setState({ showUnRead: false });
  }, [list]);

  return (
    <>
      <div
        className="w-full h-[80dvh] lg:h-[75dvh] bg-background-lv1 rounded-[40px] p-10"
        style={{ boxShadow: '0px 2px 4px 0px rgba(255, 255, 255, 0.50) inset, 0px -4px 2px 0px #215994 inset' }}
      >
        <div
          className="w-full h-full bg-[#FFEFBE] rounded-[24px] p-4 lg:p-10"
          style={{
            boxShadow:
              '0px 4px 2px 0px #FFF inset, 0px 3px 6px 0px rgba(0, 0, 0, 0.30), 0px -4px 2px 0px #DEAE7B inset',
          }}
        >
          <ScrollBox
            className="w-full h-full flex flex-col overflow-x-hidden overflow-y-auto px-4 lg:px-10 gap-6 lg:gap-12"
            onReachBottom={onReachBottom}
          >
            {list &&
              list.map((group, groupIndex) => {
                return (
                  <div className="w-full flex flex-col relative" key={groupIndex}>
                    <div className="w-[1px] bg-[#D6EABE] absolute left-[8px] top-[58px] bottom-0"></div>
                    <div className="flex items-center text-[#2E5904]">
                      <span className="font-bold text-[24px] lg:text-[32px]">{moment(group.time).format('DD')}</span>
                      <span className="px-4 text-base font-black">/</span>
                      <span className="font-bold text-[24px] lg:text-[32px]">{moment(group.time).format('MM')}</span>
                    </div>
                    {group.announcements.map((item: any, index: number) => {
                      return (
                        <div key={index} className="flex items-start w-full relative z-10">
                          <div className="flex items-center w-[70px] lg:w-[86px] flex-shrink-0 gap-3 lg:gap-6">
                            <div className="w-[17px] h-[17px] rounded-full bg-[rgba(103,198,9,0.5)] flex items-center justify-center">
                              <div className="w-4 h-4 rounded-full bg-[rgba(103,198,9,1)]"></div>
                            </div>
                            <span className="text-black text-base font-medium">
                              {moment(item.createTime).format('HH:mm')}
                            </span>
                          </div>
                          <div className="flex flex-col flex-1 pb-6 mb-6 lg:pb-12 lg:mb-12 border-b border-[#D6EABE] overflow-hidden">
                            <span className="text-md font-bold text-black">{item.title}</span>
                            <span className="text-base text-[#445234] break-words">
                              {item.content}{' '}
                              <Link href={item.link} target="_blank" className="text-primary hover:brightness-110">
                                Learn more
                              </Link>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            <CommonEmpty status={status} data={list} />
          </ScrollBox>
        </div>
      </div>
    </>
  );
};

export default NewsView;
