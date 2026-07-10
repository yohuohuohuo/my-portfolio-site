import { useGlobalStore } from '@/projects/mint-forest/hooks';
import classNames from 'classnames';
import { FC } from 'react';
import { useShallow } from 'zustand/react/shallow';

interface UnReadDotInterface {
  className?: string;
}

const UnReadDot: FC<UnReadDotInterface> = (props) => {
  const showUnRead = useGlobalStore(useShallow((state) => state.showUnRead));

  if (!showUnRead) {
    return <></>;
  }

  return (
    <div className={classNames('w-10 h-10 absolute left-4 -top-1 flex items-center justify-center', props.className)}>
      <div className="news-dot w-full h-full rounded-full bg-red-400"></div>
      <div className="w-[75%] h-[75%] bg-error rounded-full absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"></div>
    </div>
  );
};

export default UnReadDot;
