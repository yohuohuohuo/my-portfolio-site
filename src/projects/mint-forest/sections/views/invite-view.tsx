import ScrollBox from '@/shared/components/scroll-box.component';
import CommonEmpty from '@/shared/components/common-empty.component';
import { CopySvg, ITwitterSvg } from '@/shared/svg';
import { FC, useCallback, useState, useEffect } from 'react';
import { useClipboard } from 'use-clipboard-copy';
import { HttpCode } from '@/shared/const';
import { useAlert, useAxios, useGlobalStore } from '@/shared/hooks';
import moment from 'moment';
import { ellipsis, getInviteUrl } from '@/shared/utils';
import Link from 'next/link';

interface InvitationRecord {
  address: string;
  date: string;
  greenId: string;
}

interface InviteResponse {
  next: string;
  content: {
    greenId: string;
    wallet: string;
    domain: string;
    inviteTime: string;
    mfTotalAmounts: number;
  }[];
}

interface InviteViewInterface {}

const InviteView: FC<InviteViewInterface> = () => {
  const { userInfo } = useGlobalStore();
  const { copy } = useClipboard();
  const [records, setRecords] = useState<InvitationRecord[]>([]);
  const [status, setStatus] = useState<HttpCode | 'loading' | undefined>('loading');
  const [isLoading, setIsLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const alert = useAlert();

  const { run: getUserInviteData } = useAxios(
    (cursor: string | null) => ({
      url: '/api/forest/normal/getUserInviteData',
      method: 'get',
      params: {
        cursor,
      },
    }),
    {
      onSuccess: (res: InviteResponse, [cursor]: any) => {
        const { content, next } = res;

        if (!cursor && !content.length) {
          setStatus(HttpCode.NoData);
          setHasMore(false);
          setIsLoading(false);
          return;
        }

        const newRecords: InvitationRecord[] = content.map((item) => ({
          address: item.domain || item.wallet,
          date: moment(item.inviteTime).format('YYYY/MM/DD HH:mm'),
          greenId: item.greenId,
        }));

        setRecords((prevRecords) => [...prevRecords, ...newRecords]);
        setNextCursor(next);
        setHasMore(!!next);
        setStatus(HttpCode.Success);
        setIsLoading(false);
      },
      onError: () => {
        setStatus(HttpCode.Error);
        setHasMore(false);
        setIsLoading(false);
      },
    }
  );

  useEffect(() => {
    setStatus('loading');
    getUserInviteData(null);
  }, []);

  const handleCopyCode = () => {
    copy(userInfo?.inviteCode);
    alert.success('Code copied to clipboard!');
  };

  const handleShareTwitter = () => {
    if (!userInfo) return;
    const tweetText = `🌳 I just started my forest in Mint Forest V3 — a fun Web3 game where you grow, earn, and explore!\n\nUse my invite code ${
      userInfo.inviteCode
    } to join and start collecting rewards with me!\n\n🚀 Let’s build a forest together: ${getInviteUrl(
      userInfo.inviteCode
    )}\n\n#MintBlockchain #Web3Gaming`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
  };

  const onReachBottom = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setStatus('loading');
    getUserInviteData(nextCursor);
  }, [isLoading, hasMore, nextCursor]);

  return (
    <div
      className="w-full h-[80vh] lg:h-[75vh] bg-background-lv1 rounded-[40px] p-10"
      style={{
        boxShadow: '0px 2px 4px 0px rgba(255, 255, 255, 0.50) inset, 0px -4px 2px 0px #215994 inset',
      }}
    >
      <div className="flex flex-col gap-6 h-full">
        <div
          className="w-full bg-[#FFEFBE] rounded-[24px] p-8 lg:h-[160px]"
          style={{
            boxShadow:
              '0px 4px 2px 0px #FFF inset, 0px 3px 6px 0px rgba(0, 0, 0, 0.30), 0px -4px 2px 0px #DEAE7B inset',
          }}
        >
          <div className="flex flex-col h-full">
            <div className="mb-8">
              <h2 className="text-[#A45118] text-xl font-bold">Invitation code</h2>
              <p className="text-[#B57B46] text-md leading-normal">
                You can obtain{' '}
                <span className="text-black font-bold">{Number(userInfo?.inviteSpeedAmounts) * 100}%</span> of the MF
                collected by the users you've invited!
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[#A45118] text-[28px] leading-[36px] font-bold">{userInfo?.inviteCode}</span>
              <div className="flex gap-16">
                <button
                  onClick={handleCopyCode}
                  className="text-[#B57B46] flex items-center gap-2 text-[12px] lg:text-[14px]"
                >
                  <CopySvg className="w-12 h-12" />
                  Copy Code
                </button>
                <button
                  onClick={handleShareTwitter}
                  className="text-[#B57B46] flex items-center gap-2 text-[12px] lg:text-[14px]"
                >
                  <ITwitterSvg />
                  Share Twitter
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          className="flex-1 w-full bg-[#FFEFBE] rounded-[24px] p-8 min-h-0"
          style={{
            boxShadow:
              '0px 4px 2px 0px #FFF inset, 0px 3px 6px 0px rgba(0, 0, 0, 0.30), 0px -4px 2px 0px #DEAE7B inset',
          }}
        >
          <ScrollBox
            className="w-full h-full flex flex-col gap-6 overflow-auto no-scrollbar"
            onReachBottom={onReachBottom}
            distance={100}
          >
            <h2 className="text-[#A45118] text-xl font-bold">Invitation Record</h2>
            {records.length > 0 && (
              <div className="flex flex-col gap-6">
                {records.map((record, index) => (
                  <div key={index} className="flex justify-between text-[#A45118] text-[14px] leading-normal">
                    <Link href={`/mint-forest?id=${record.greenId}`} className="lg:block hidden">
                      {record.address}
                    </Link>
                    <Link href={`/mint-forest?id=${record.greenId}`} className="lg:hidden block">
                      {ellipsis(record.address, 4, 4)}
                    </Link>
                    <span>{record.date}</span>
                  </div>
                ))}
              </div>
            )}
            <CommonEmpty data={records} status={status} />
          </ScrollBox>
        </div>
      </div>
    </div>
  );
};

export default InviteView;
