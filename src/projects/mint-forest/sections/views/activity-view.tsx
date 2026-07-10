import LinearSpan from '@/projects/mint-forest/components/common/linear-span.component';
import ScrollBox from '@/projects/mint-forest/components/common/scroll-box.component';
import CommonEmpty from '@/projects/mint-forest/components/common/common-empty.component';
import { FC, useEffect, useState, useCallback } from 'react';
import { HttpCode } from '@/projects/mint-forest/types/api';
import { mintForestGateway } from '../../data/runtime';
import { useDemoRequest } from '../../hooks/use-demo-request.hook';
import moment from 'moment';
import { formatNumber } from '@/projects/mint-forest/utils';
import { useGlobalConfig } from '@/projects/mint-forest/hooks/use-global-config.hook';
import { useShallow } from 'zustand/react/shallow';

interface ActivityItem {
  wallet: string;
  domain: string;
  txType: number;
  txHash: string;
  status: number;
  contract: string;
  tokenId: string;
  destination: string;
  amount: number;
  targetId: number;
  turntableUnit: string;
  name: string;
  createTime: string;
}

interface ActivityResponse {
  content: ActivityItem[];
  next: string;
}

interface ActivityViewInterface {}

const TX_TYPE_MAP: Record<number, string> = {
  0: 'Create',
  1: 'Mint',
  2: 'Transfer',
  3: 'Sale',
  4: 'Burn',
  5: 'Activate',
  6: 'Claim Daily MF',
  7: 'Claim Invite MF',
  8: 'Steal MF',
  9: 'Opened a Mystery MF Box',
  10: 'Lucky Spin', //Turn Table
};

const ActivityView: FC<ActivityViewInterface> = () => {
  const [data, setData] = useState<Record<string, ActivityItem[]>>({});
  const [status, setStatus] = useState<HttpCode | 'loading' | undefined>('loading');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const turntableSpent = useGlobalConfig(useShallow((state) => state.turntableSpent));

  const { run: queryActivity } = useDemoRequest<ActivityResponse, [string | null]>(
    (cursor: string | null) => ({
      url: '/api/forest/normal/getUserActivity',
      method: 'GET',
      params: {
        cursor,
      },
    }),
    {
      gateway: mintForestGateway,
      onSuccess: (res, [cursor]) => {
        const { content: newActivities, next: newCursor } = res;

        const isFirstCall = cursor === null;
        if (isFirstCall && newActivities.length === 0) {
          setStatus(HttpCode.NoData);
          setHasMore(false);
          return;
        }

        const grouped = newActivities.reduce((acc, item) => {
          const date = moment(item.createTime).format('YYYY-MM-DD');
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(item);
          return acc;
        }, {} as Record<string, ActivityItem[]>);

        setData((prev) => {
          const updated = { ...prev };
          Object.entries(grouped).forEach(([date, activities]) => {
            if (updated[date]) {
              updated[date] = [...updated[date], ...activities];
            } else {
              updated[date] = activities;
            }
          });
          return updated;
        });

        setCursor(newCursor);
        setHasMore(!!newCursor);
        setStatus(HttpCode.Success);
      },
      onError: () => {
        setStatus(HttpCode.Error);
        setHasMore(false);
      },
    }
  );

  useEffect(() => {
    queryActivity(null);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore && status !== 'loading') {
      setStatus('loading');
      queryActivity(cursor);
    }
  }, [hasMore, status, cursor]);

  return (
    <div
      className="w-full h-[80dvh] lg:h-[86dvh] bg-background-lv1 rounded-[40px] p-10 flex flex-col"
      style={{ boxShadow: '0px 2px 4px 0px rgba(255, 255, 255, 0.50) inset, 0px -4px 2px 0px #215994 inset' }}
    >
      <LinearSpan
        className="text-[20px] leading-[28px] lg:text-[28px] lg:leading-[36px] font-bold relative"
        style={{
          background: 'linear-gradient(180deg, #FFF 0%, #FFCC2F 100%)',
          filter: 'drop-shadow(0px 1px 2px #073F7A)',
        }}
      >
        MF Activity
      </LinearSpan>
      <div
        className="w-full flex-1 bg-[#FFEFBE] rounded-[24px] px-10 py-12 mt-9 min-h-0"
        style={{
          boxShadow: '0px 4px 2px 0px #FFF inset, 0px 3px 6px 0px rgba(0, 0, 0, 0.30), 0px -4px 2px 0px #DEAE7B inset',
        }}
      >
        <ScrollBox
          className="w-full h-full flex flex-col gap-4 overflow-auto no-scrollbar"
          onReachBottom={handleLoadMore}
        >
          {Object.entries(data).map(([date, activities], dateIndex) => (
            <div key={dateIndex} className="w-full">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[#000] text-[12px]">{date}</p>
              </div>
              {activities.map((item, index) => (
                <div key={index} className="w-full flex flex-col mb-6 last:mb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <p className="text-[#A45118] text-[14px] leading-[22px]">
                        {TX_TYPE_MAP[item.txType] || 'unknown'}

                        {item.txType === 10 && turntableSpent && (
                          <>
                            <span className="px-2">Spent</span>
                            <span className="text-[#FF2424] font-DINCond text-lg">-{turntableSpent}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.txType === 10 && (
                        <>
                          <span className="text-[14px] text-[#7F8D81]">Earn</span>
                        </>
                      )}

                      {item.amount > 0 && (
                        <p className="text-[#00B33B] text-[20px] font-DINCond">+{formatNumber(item.amount)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <CommonEmpty data={Object.values(data).flat()} status={status} />
        </ScrollBox>
      </div>
    </div>
  );
};

export default ActivityView;
