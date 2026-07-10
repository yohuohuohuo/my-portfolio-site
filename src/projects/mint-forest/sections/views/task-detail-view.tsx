import CommonImg from '@/shared/components/common-img.component';
import { ArrowSvg } from '@/shared/svg';
import Link from 'next/link';
import { FC, useCallback, useEffect, useState } from 'react';
import TaskResultView from './task-result-modal';
import parse from 'html-react-parser';
import { useAlert } from '@/shared/hooks';
import { HttpCode } from '@/shared/const';
import moment from 'moment';
import LoadMore from '@/shared/components/loadmore/loadmore.component';
import CommonEmpty from '@/shared/components/common-empty.component';
import GoButton from '../../components/go-button.component';
import { formatNumber } from '@/shared/utils';
import type { TaskVerifyResult } from '../../types/api';
import { mintForestGateway } from '../../data/runtime';
import { useDemoRequest } from '../../hooks/use-demo-request.hook';

interface TaskDetail {
  id: number;
  taskName: string;
  taskTitle: string;
  description: string;
  logo: string;
  link: string;
  linkButton: string;
  mf: number;
  done: number;
  status: number;
  startDate: number;
  endDate: number;
}

interface TaskDetailViewProps {
  id: number;
  onBack: () => void;
}

const TaskDetailView: FC<TaskDetailViewProps> = ({ id, onBack }) => {
  const [taskResultVisible, setTaskResultVisible] = useState(false);
  const [taskDetail, setTaskDetail] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [verifyInput, setVerifyInput] = useState<string>('');
  const [verifyLoading, setVerifyLoading] = useState<boolean>(false);
  const [goLoading, setGoLoading] = useState<boolean>(false);
  const alert = useAlert();

  const { run: queryTaskDetail } = useDemoRequest<TaskDetail, [number]>(
    (id) => ({
      url: `/api/forest/task/detail/${id}`,
      method: 'GET',
    }),
    {
      gateway: mintForestGateway,
      onSuccess: (res) => {
        setTaskDetail(res);
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    }
  );

  const { run: checkRedotPay } = useDemoRequest<TaskVerifyResult, [string]>(
    (uid) => ({
      url: '/api/forest/task/checkRedotPay',
      method: 'GET',
      params: { uid },
    }),
    {
      gateway: mintForestGateway,
      onSuccess: () => {
        setTaskResultVisible(true);
        setVerifyLoading(false);
      },
      onError: (error) => {
        alert.error(error.msg || 'Failed to check RedotPay task');
        setVerifyLoading(false);
      },
    }
  );

  const { run: checkBridge } = useDemoRequest<TaskVerifyResult, [string]>(
    (txHash: string) => ({
      url: '/api/forest/task/checkBridge',
      method: 'GET',
      params: { txHash },
    }),
    {
      gateway: mintForestGateway,
      onSuccess: () => {
        setTaskResultVisible(true);
        setVerifyLoading(false);
      },
      onError: (error) => {
        alert.error(error.msg || 'Failed to check Bridge task');
        setVerifyLoading(false);
      },
    }
  );

  const { run: checkJoinDiscord } = useDemoRequest<TaskVerifyResult, [string, number]>(
    (code: string) => ({
      url: '/api/forest/task/checkJoinDiscord',
      method: 'GET',
      params: { code },
    }),
    {
      gateway: mintForestGateway,
      onSuccess: () => {
        setTaskResultVisible(true);
        setGoLoading(false);
      },
      onError: (error) => {
        alert.error(error.msg || 'Failed to check Discord task');
        setGoLoading(false);
      },
    }
  );

  useEffect(() => {
    if (id) {
      setLoading(true);
      queryTaskDetail(id);
    }
  }, [id]);

  const handleVerify = useCallback(() => {
    if (verifyInput) {
      setVerifyLoading(true);
      if (id === 4) {
        checkBridge(verifyInput);
      } else if (id === 6) {
        checkRedotPay(verifyInput);
      }
    } else {
      alert.error('Please enter a valid input');
    }
  }, [id, verifyInput]);

  const handleTask = useCallback(async () => {
    if (id === 3) {
      setGoLoading(true);
      checkJoinDiscord('FOREST-DISCORD', taskDetail?.mf || 0);
      return;
    }

    if (taskDetail?.link) {
      window.open(taskDetail?.link, '_blank');
    }
  }, [id, taskDetail]);

  const formatDate = (timestamp: number) => {
    return moment(timestamp).format('YYYY/MM/DD');
  };

  return (
    <div
      className="w-full h-full flex flex-col bg-[#FFEFBE] rounded-[24px] p-8"
      style={{
        boxShadow: '0px 4px 2px 0px #FFF inset, 0px 3px 6px 0px rgba(0, 0, 0, 0.30), 0px -4px 2px 0px #DEAE7B inset',
      }}
    >
      {loading && <LoadMore />}

      {!loading && taskDetail && (
        <div className="flex flex-col h-full gap-5 lg:gap-12 overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-4 text-[16px] cursor-pointer" onClick={onBack}>
            <div className="flex justify-center text-white items-center w-20 h-20 border-[3px] border-[#fff] rounded-[12px] bg-[#F5A054]">
              <ArrowSvg className="rotate-180" />
            </div>
            Back
          </div>
          <div className="flex gap-5 lg:gap-12 lg:-mt-4">
            <div className="w-[100px] h-[100px] lg:w-[160px] lg:h-[160px] shrink-0 rounded-[12px] p-2 flex justify-center items-center bg-white overflow-hidden">
              <CommonImg
                src={taskDetail.logo}
                alt={taskDetail.taskTitle}
                className="w-full h-full rounded-[10px] object-cover"
              />
            </div>
            <div className="flex flex-col gap-4 flex-1">
              <h2 className="text-[#A45118] text-[16px] lg:text-[20px] leading-[28px] font-bold">
                {taskDetail.taskTitle || taskDetail.taskName}
              </h2>
              <div className="text-[14px] leading-[22px] text-[#A45118] lg:hidden">
                {formatNumber(taskDetail.done)} Done
              </div>
              <div className="text-[14px] leading-[22px] text-[#A45118] lg:hidden flex items-center gap-6">
                {formatDate(taskDetail.startDate)}
                {taskDetail.mf && (
                  <>
                    <div className="w-[1px] h-[13px] bg-[#CEA27A]"></div>
                    <span>{formatNumber(taskDetail.mf)}MF</span>
                  </>
                )}
              </div>
              <p className="hidden lg:block text-[#B57B46] text-[12px] leading-[22px]">
                {parse(taskDetail.description || '')}
              </p>
            </div>
          </div>

          <div className="flex gap-12 flex-1">
            <div className="w-[160px] hidden lg:block"></div>
            <div className="flex flex-col flex-1 w-full">
              <div className="hidden lg:flex items-center gap-8 text-[14px] leading-[22px] text-[#A45118]">
                <span>{formatNumber(taskDetail.done)} Done</span>
                <div className="w-[1px] h-[9px] bg-[#A45118]"></div>
                <span>{formatDate(taskDetail.startDate)}</span>
                <div className="w-[1px] h-[9px] bg-[#A45118]"></div>
                {taskDetail.mf && <span>{formatNumber(taskDetail.mf)}MF</span>}
              </div>

              <div className="lg:hidden w-full text-[12px] leading-[20px] text-[#B57B46] flex-1 min-h-0 mt-5">
                {parse(taskDetail.description || '')}
              </div>

              {(id === 4 || id === 6) && (
                <div className="flex w-full bg-[#FFD8AC] rounded-[24px] border border-[#E6A55A] p-5 lg:p-12 gap-4 lg:gap-8 justify-between mt-7 lg:mt-10 items-center">
                  <input
                    type="text"
                    placeholder={
                      id === 4
                        ? 'Enter the tx hash of your cross-chain transfer on Mint Mainnet to verify'
                        : 'Enter your Redotpay uid to verify'
                    }
                    value={verifyInput}
                    onChange={(e) => setVerifyInput(e.target.value)}
                    className="flex-1 h-full rounded-[11px] bg-[#E6A55A] lg:pl-8 pl-2 text-black placeholder:text-[#A45118] lg:text-[14px] text-[12px] w-full lg:w-auto"
                  />
                  {<GoButton className="!w-36" text={verifyLoading ? <LoadMore /> : 'Verify'} onClick={handleVerify} />}
                </div>
              )}

              <div className="flex w-full bg-[#FFD8AC] rounded-[24px] border border-[#E6A55A] p-5 lg:p-12 justify-between mt-7 lg:mt-10 items-center">
                <div className="flex flex-col gap-4 flex-1 min-w-0 mr-2 lg:mr-0">
                  {taskDetail.link && (
                    <>
                      <p className="text-[#A45118] text-[14px] lg:text-[14px] font-bold flex justify-between items-center">
                        Links
                        <GoButton
                          text={goLoading ? <LoadMore className="block lg:hidden" /> : id === 3 ? 'Verify' : 'Go'}
                          className="block lg:hidden !w-36"
                          onClick={handleTask}
                        />
                      </p>
                      <Link href={taskDetail.link} target="_blank" className="text-[#B57B46] text-[14px] truncate">
                        {taskDetail.link}
                      </Link>
                    </>
                  )}
                </div>
                <GoButton
                  text={goLoading ? <LoadMore className="lg:block hidden" /> : id === 3 ? 'Verify' : 'Go'}
                  className="lg:block hidden !w-36"
                  onClick={handleTask}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !taskDetail && <CommonEmpty status={HttpCode.NoData} />}
      <TaskResultView
        reward={taskDetail?.mf}
        show={taskResultVisible}
        onClose={() => {
          setTaskResultVisible(false);
          onBack();
        }}
      />
    </div>
  );
};

export default TaskDetailView;
