import CommonImg from '@/projects/mint-forest/components/common/common-img.component';
import classNames from 'classnames';
import { motion } from 'motion/react';
import { FC, useMemo, useState } from 'react';
import LuckySpin from './lucky-spin/lucky-spin.component';
import LeaderboardView from './views/leaderboard-view';
import TaskView from './views/task-view';

interface MenuMobileInterface {}

const Menus = [
  { name: 'Forest', icon: { url: '/projects/mint-forest/images/ic-forest.png', className: 'w-32 relative -bottom-1' } },
  { name: 'Task', icon: { url: '/projects/mint-forest/images/ic-task.png', className: 'w-22 relative -bottom-line' } },
  { name: 'LB', icon: { url: '/projects/mint-forest/images/ic-leaderboard.png', className: 'w-26 relative -bottom-2' } },
  { name: 'Lucky', icon: { url: '/projects/mint-forest/images/ic-lucky.png', className: 'w-28 relative' } },
];

const MenuMobile: FC<MenuMobileInterface> = (props) => {
  const [active, setActive] = useState('Forest');

  const content = useMemo(() => {
    switch (active) {
      case 'Task':
        return (
          <div className="flex-1 w-full bg-[#2B344F] relative z-10 flex items-center justify-center">
            <TaskView onClose={() => setActive('Forest')} />
          </div>
        );
      case 'LB':
        return (
          <div className="flex-1 w-full bg-[#2B344F] relative z-10 flex items-center justify-center">
            <LeaderboardView />
          </div>
        );
      case 'Lucky':
        return (
          <div className="flex-1 w-full bg-[#2B344F] relative z-10 flex items-center justify-center">
            <LuckySpin />
          </div>
        );
      default:
        return <></>;
    }
  }, [active]);

  const onMenuClick = (item: any, index: number) => {
    setActive(item.name);
  };

  const activeIndex = useMemo(() => {
    const index = Menus.findIndex((item) => item.name === active);
    return index;
  }, [active]);

  return (
    <div
      className={classNames('mb-only w-full absolute left-0 bottom-0 flex flex-col', { 'h-full': active !== 'Forest' })}
    >
      {content}
      <div
        className="w-full flex items-center relative h-50 border-t border-[#00659C] z-20"
        style={{
          background: 'linear-gradient(180deg, rgba(78, 182, 250, 0.60) 0%, rgba(1, 117, 205, 0.60) 100%)',
          boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(5px)',
        }}
      >
        <motion.div
          className="h-[110px] w-[25vw] absolute left-0 bottom-0 border border-[#0367A8] rounded-t-lg"
          style={{
            background: 'linear-gradient(180deg, #8BD1FF 0%, #1F9FFF 100%)',
            boxShadow: '0px 2px 4px 0px rgba(255, 255, 255, 0.39) inset',
          }}
          animate={{ translateX: `${activeIndex * 25}vw` }}
        ></motion.div>
        {Menus.map((item, index) => {
          return (
            <div key={index} className="flex-1 h-full relative z-10" onClick={() => onMenuClick(item, index)}>
              <div className="flex flex-col items-center absolute bottom-4 left-1/2 -translate-x-1/2 origin-center">
                <motion.div
                  animate={{ scale: item.name === active ? 1.6 : 1, translateY: item.name === active ? '-18px' : 0 }}
                  transition={{ bounce: 0.25 }}
                >
                  <CommonImg local src={item.icon.url} className={item.icon.className} alt={'icon'} />
                </motion.div>
                <span
                  className={classNames(
                    'font-semibold',
                    item.name === active ? 'text-lg text-white' : 'text-md text-[#CDDEEE]'
                  )}
                >
                  {item.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MenuMobile;
