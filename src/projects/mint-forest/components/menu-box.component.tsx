import CommonImg from '@/shared/components/common-img.component';
import classNames from 'classnames';
import { FC, JSX, useEffect, useState } from 'react';
import UnReadDot from './unread-dot.component';

interface MenuBoxInterface {
  className: string;
  menus: MenuItem[];
  defaultActive?: string;
  onMenuClick?: (item: MenuItem) => void;
}

export interface MenuItem {
  background: string;
  icon: JSX.Element;
  name: string;
}

const MenuConfig: { [key: string]: MenuItem } = {
  Task: {
    background: 'linear-gradient(180deg, #A3B4F6 0%, #445EC6 100%)',
    icon: <CommonImg local src="/projects/mint-forest/images/ic-task.png" className="w-28 relative -bottom-2" alt={'icon'} />,
    name: 'Task',
  },
  Lucky: {
    background: 'linear-gradient(180deg, #FFC400 0%, #FFA900 121.25%)',
    icon: <CommonImg local src="/projects/mint-forest/images/ic-lucky.png" className="w-32 relative -bottom-1" alt={'icon'} />,
    name: 'Lucky',
  },
  LB: {
    background: 'linear-gradient(180deg, #FFADB0 0%, #E3555A 100%)',
    icon: <CommonImg local src="/projects/mint-forest/images/ic-leaderboard.png" className="w-30 relative -bottom-2" alt={'icon'} />,
    name: 'LB',
  },
  Invite: {
    background: 'linear-gradient(180deg, #9BD6EB 0%, #4A6DFA 82%)',
    icon: (
      <div className="relative">
        <CommonImg local src="/projects/mint-forest/images/ic-invite.png" className="w-28 relative -bottom-0" alt={'icon'} />
        <div
          className="w-full h-10 absolute left-0 bottom-0"
          style={{ background: 'linear-gradient(180deg, rgba(130, 182, 240, 0.17) 0%, #6C98F4 74.87%, #6691F5 100%)' }}
        />
      </div>
    ),
    name: 'Invite',
  },
  BP: {
    background: 'linear-gradient(180deg, #FCD75D 0%, #3DCC90 100%)',
    icon: <CommonImg local src="/projects/mint-forest/images/ic-backpack.png" className="w-30 relative -bottom-2" alt={'icon'} />,
    name: 'BP',
  },
  MSG: {
    background: 'linear-gradient(180deg, #F9D06A 0%, #FF9000 88.75%)',
    icon: <CommonImg local src="/projects/mint-forest/images/ic-msg.png" className="w-31 relative -bottom-2" alt={'icon'} />,
    name: 'News',
  },
  RP: {
    background: 'linear-gradient(180deg, #FFB261 0%, #FF006F 100%)',
    icon: <CommonImg local src="/projects/mint-forest/images/ic-redpacket.png" className="w-32 relative -bottom-2" alt={'icon'} />,
    name: 'RP',
  },
};

export const PublicMenus = [MenuConfig.Task, MenuConfig.Lucky, MenuConfig.LB];

export const PrivateMenus = [MenuConfig.Invite, MenuConfig.BP, MenuConfig.MSG];

const MenuBox: FC<MenuBoxInterface> = (props) => {
  const [active, setActive] = useState<string>();

  useEffect(() => {
    setActive(props.defaultActive);
  }, [props.defaultActive]);

  const onMenuClick = (menu: MenuItem) => {
    setActive(menu.name);
    props.onMenuClick && props.onMenuClick(menu);
  };

  return (
    <>
      <div className={classNames('flex items-center', props.className)}>
        {props.menus &&
          props.menus.map((item, index) => {
            return (
              <div
                key={index}
                className={classNames(
                  'w-30 h-30 rounded-3xl border-2 border-white relative cursor-pointer transition-all',
                  {
                    'opacity-50': props.defaultActive && active != item.name,
                  }
                )}
                style={{
                  background: item.background,
                  filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.34))',
                }}
                onClick={() => onMenuClick(item)}
              >
                <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2 bottom-1">
                  {item.icon}
                  <span className="text-md font-semibold text-white">{item.name}</span>
                </div>
                {item.name == 'News' && <UnReadDot className="!-left-2 !-top-8" />}
              </div>
            );
          })}
      </div>
    </>
  );
};

export default MenuBox;
