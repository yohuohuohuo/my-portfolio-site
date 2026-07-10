import { FC, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAlert, useAxios, useGlobalStore } from '@/shared/hooks';
import TaskResultView from '../sections/views/task-result-modal';

interface OAuthValidatorProps {}

const OAuthValidator: FC<OAuthValidatorProps> = () => {
  const router = useRouter();
  const alert = useAlert();
  const [taskResultVisible, setTaskResultVisible] = useState(false);
  const [taskDetail, setTaskDetail] = useState<any>(null);
  const hasProcessedRef = useRef(false);

  const { run: queryTaskDetail } = useAxios(
    () => ({
      url: `/api/forest/task/detail/3`,
      method: 'get',
    }),
    {
      onSuccess: (res: any) => {
        setTaskDetail(res);
      },
      onError: () => {
        alert.error('Failed to fetch Discord task details');
        router.replace(router.pathname, undefined, { shallow: true });
        hasProcessedRef.current = true;
      },
    }
  );

  const { run: checkJoinDiscord } = useAxios(
    (code: string) => ({
      url: '/api/forest/task/checkJoinDiscord',
      method: 'get',
      params: { code },
    }),
    {
      original: true,
      onSuccess: () => {
        setTaskResultVisible(true);
        router.replace(router.pathname, undefined, { shallow: true });
        hasProcessedRef.current = true;
      },
      onError: (error: any) => {
        alert.error(error.msg || 'Failed to check Discord task');
        router.replace(router.pathname, undefined, { shallow: true });
        hasProcessedRef.current = true;
      },
    }
  );

  useEffect(() => {
    if (!router.isReady || hasProcessedRef.current) return;

    const code = router.query.code as string | undefined;
    const error = router.query.error as string | undefined;

    if (error) {
      alert.error(error || 'Discord authorization failed');
      router.replace(router.pathname, undefined, { shallow: true });
      hasProcessedRef.current = true;
      return;
    }

    if (code) {
      queryTaskDetail();
    }
  }, [router.isReady]);

  useEffect(() => {
    if (!taskDetail || !router.query.code || hasProcessedRef.current) return;

    const code = router.query.code as string;

    if (taskDetail.status === 0) {
      try {
        checkJoinDiscord(code);
      } catch (err: any) {
        alert.error(err.message || 'Failed to process Discord callback');
        router.replace(router.pathname, undefined, { shallow: true });
        hasProcessedRef.current = true;
      }
    } else {
      router.replace(router.pathname, undefined, { shallow: true });
      hasProcessedRef.current = true;
    }
  }, [taskDetail]);

  const onTaskResultClose = () => {
    setTaskResultVisible(false);
    setTaskDetail(null);
  };

  return (
    <>{taskDetail && <TaskResultView reward={taskDetail.mf} show={taskResultVisible} onClose={onTaskResultClose} />}</>
  );
};

export default OAuthValidator;
