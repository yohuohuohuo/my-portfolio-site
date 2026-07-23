import { FC, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import moment from 'moment';
import parse from 'html-react-parser';
import { motion } from 'motion/react';
import { HttpCode } from '@/projects/mint-forest/types/api';
import { useAlert } from '@/projects/mint-forest/hooks';
import CommonEmpty from '@/projects/mint-forest/components/common/common-empty.component';
import CommonImg from '@/projects/mint-forest/components/common/common-img.component';
import ScrollBox from '@/projects/mint-forest/components/common/scroll-box.component';
import TaskDetailView from './task-detail-view';
import GoButton from '../../components/go-button.component';
import TaskResultView from './task-result-modal';
import { BtDoneSvg } from '@/projects/mint-forest/assets/svg';
import { NotifyEvent, notifyService } from '@/projects/mint-forest/services/notify.service';
import { formatNumber } from '@/projects/mint-forest/utils';
import type { TaskVerifyResult } from '../../types/api';
import { mintForestGateway } from '../../data/runtime';
import { useDemoRequest } from '../../hooks/use-demo-request.hook';

interface TaskItem {
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

interface TaskType {
  name: string;
  type: number;
  width: number;
}

interface TaskViewInterface {
  onClose?: () => void;
}

const Types: TaskType[] = [
  { name: 'General Tasks', type: 0, width: 150 },
  { name: 'Ecosystem Tasks', type: 1, width: 160 },
];

const TaskView: FC<TaskViewInterface> = (props) => {
  const [taskType, setTaskType] = useState(Types[0]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [status, setStatus] = useState<HttpCode | 'loading' | undefined>('loading');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const alert = useAlert();
  const [taskResultVisible, setTaskResultVisible] = useState(false);
  const [mf, setMf] = useState<number>(0);
  const [activeStatus, setActiveStatus] = useState(false);

  const { run: queryTask } = useDemoRequest<TaskItem[], [number]>(
    (type) => ({
      url: '/api/forest/task/list',
      method: 'GET',
      params: { type },
    }),
    {
      gateway: mintForestGateway,
      onSuccess: (res) => {
        setTasks(res);
        setStatus(res.length ? HttpCode.Success : HttpCode.NoData);
      },
      onError: () => {
        setStatus(HttpCode.Error);
      },
    }
  );

  const { run: checkFollowX } = useDemoRequest<TaskVerifyResult, [number]>(
    () => ({
      url: '/api/forest/task/checkFollowX',
      method: 'GET',
    }),
    {
      gateway: mintForestGateway,
      onSuccess: (res, [mf]) => {
        setMf(res.reward || mf);
        setTaskResultVisible(true);
      },
      onError: (error) => {
        alert.error(error.msg || 'Failed to check Follow X task');
      },
    }
  );

  useEffect(() => {
    queryTask(taskType.type);
  }, [taskType]);

  const onTypeClick = (item: TaskType) => {
    if (item.type === taskType.type) return;
    setTasks([]);
    setTaskType(item);
    setStatus('loading');
    setActiveStatus(false);
  };

  const formatDate = (timestamp: number) => {
    return moment(timestamp).format('YYYY/MM/DD');
  };

  const handleOpenTaskDetail = async (task: TaskItem) => {
    if (task.id === 1) {
      props.onClose && props.onClose();
      setTimeout(() => {
        notifyService.notify(NotifyEvent.SHOW_GREENID);
      }, 500);
      return;
    }
    if (task.id === 2) {
      checkFollowX(task.mf);
      return;
    }
    setSelectedTaskId(task.id);
  };

  const handleBack = () => {
    queryTask(taskType.type);
    setSelectedTaskId(null);
  };

  const renderTasks = useMemo(
    () => tasks.filter((task) => (activeStatus ? task.status === 1 : task.status === 0)),
    [tasks, activeStatus]
  );

  return (
    <div
      data-testid="task-view"
      className="w-[94vw] h-[82dvh] lg:w-full lg:h-[86dvh] bg-background-lv1 rounded-[20px] lg:rounded-[40px] p-6 lg:p-10 flex flex-col items-start"
      style={{ boxShadow: '0px 2px 4px 0px rgba(255, 255, 255, 0.50) inset, 0px -4px 2px 0px #215994 inset' }}
    >
      {!selectedTaskId && (
        <div className="h-20 rounded-[26px] bg-[#058] relative overflow-hidden p-1 flex items-center gap-2">
          <motion.div
            className="h-18 rounded-[24px] bg-[#8CD2FB] absolute left-1 top-1 z-0"
            transition={{ type: 'spring', duration: 0.2, bounce: 0.2 }}
            style={{
              boxShadow:
                '0px 2px 1px 0px rgba(255, 255, 255, 0.80) inset, 0px 3px 6px 0px rgba(0, 0, 0, 0.30), 0px -2px 4px 0px #005183 inset',
            }}
            animate={{ width: taskType.width, translateX: taskType.type === 0 ? 0 : Types[0].width + 4 }}
          />
          {Types.map((item, index) => (
            <span
              key={index}
              className={classNames(
                'text-lg font-bold transition-all cursor-pointer relative z-10 text-center',
                taskType.type === item.type ? 'text-white' : 'text-[#83D6FF]'
              )}
              style={{ width: item.width }}
              onClick={() => onTypeClick(item)}
            >
              {item.name}
            </span>
          ))}
        </div>
      )}
      <div className="w-full flex-1 min-h-0 mt-6">
        {selectedTaskId ? (
          <TaskDetailView id={selectedTaskId} onBack={handleBack} />
        ) : (
          <ScrollBox className="w-full h-full overflow-auto no-scrollbar">
            <div className="flex flex-col gap-4">
              <div className="flex gap-12 text-white text-[16px] leading-[24px] my-4">
                <span
                  className={classNames(
                    'cursor-pointer pb-2',
                    !activeStatus && 'border-b text-[#00FFC3] border-[#00FFC3]'
                  )}
                  onClick={() => setActiveStatus(false)}
                >
                  In Progress
                </span>
                <span
                  className={classNames(
                    'cursor-pointer pb-2',
                    activeStatus && 'border-b text-[#00FFC3] border-[#00FFC3]'
                  )}
                  onClick={() => setActiveStatus(true)}
                >
                  Completed
                </span>
              </div>
              {renderTasks.length > 0 &&
                renderTasks.map((task) => (
                  <div
                    data-testid={`task-card-${task.id}`}
                    key={task.id}
                    className="w-full bg-[#FFEFBE] rounded-[24px] p-8 flex items-center justify-between"
                    style={{
                      boxShadow:
                        '0px 4px 2px 0px #FFF inset, 0px 3px 6px 0px rgba(0, 0, 0, 0.30), 0px -4px 2px 0px #DEAE7B inset',
                    }}
                  >
                    <div className="flex flex-1 items-center gap-4">
                      <div className="w-30 h-30 lg:w-36 lg:h-36 rounded-[12px] shrink-0 overflow-hidden bg-white p-1 flex items-center justify-center">
                        <CommonImg
                          src={task.logo}
                          alt={task.taskTitle}
                          className="w-full h-full object-cover rounded-[5px] lg:rounded-[10px]"
                        />
                      </div>
                      <div className="flex-1 flex flex-col min-w-0 h-36">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-6">
                          <h3 className="text-[#A45118] text-[16px] font-bold line-clamp-1">
                            {task.taskTitle || task.taskName}
                          </h3>
                          <div className="w-[1px] h-[13px] bg-[#CEA27A] hidden lg:block"></div>
                          <div className="text-[#B57B46] text-[12px] lg:text-[14px] leading-[20px] flex items-center gap-6">
                            {formatDate(task.startDate)}
                            {task.mf && (
                              <>
                                <div className="w-[1px] h-[13px] bg-[#CEA27A]"></div>
                                <span>{formatNumber(task.mf)}MF</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="w-full text-[#B57B46] text-[12px] leading-[20px] line-clamp-1 lg:line-clamp-2 mt-2">
                          {parse(task.description || '')}
                        </div>
                      </div>
                    </div>
                    {task.status === 0 ? (
                      <GoButton testId={`task-open-${task.id}`} className="shrink-0 lg:ml-40" onClick={() => handleOpenTaskDetail(task)} />
                    ) : (
                      <BtDoneSvg className="shrink-0" />
                    )}
                  </div>
                ))}
              <CommonEmpty
                data={renderTasks}
                status={status === HttpCode.Success ? (renderTasks.length ? status : HttpCode.NoData) : status}
              />
            </div>
          </ScrollBox>
        )}
      </div>
      <TaskResultView
        reward={mf}
        show={taskResultVisible}
        onClose={() => {
          setTaskResultVisible(false);
          queryTask(taskType.type);
        }}
      />
    </div>
  );
};

export default TaskView;
