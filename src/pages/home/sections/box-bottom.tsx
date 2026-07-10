import CommonModal from '@/shared/components/common-modal.component';
import { useMobile } from '@/shared/hooks';
import { FC, useState } from 'react';
import GreenId from '../components/green-id.component';
import MenuBox, { MenuItem, PrivateMenus, PublicMenus } from '../components/menu-box.component';
import MenuMy from '../components/menu-my.component';
import SearchBox from '../components/search-box.component';
import LuckySpin from './lucky-spin/lucky-spin.component';
import BackPackView from './views/backpack-view';
import InviteView from './views/invite-view';
import LeaderboardView from './views/leaderboard-view';
import NewsView from './views/news-view';
import TaskView from './views/task-view';
import EnergyBox from '../components/energy-box.component';

interface BoxBottomInterface {}

const BoxBottom: FC<BoxBottomInterface> = (props) => {
  const { isMobile } = useMobile();
  const [showModal, setShowModal] = useState('');

  const onModalClose = () => {
    setShowModal('');
  };

  const onMenuClick = (menu: MenuItem) => {
    setShowModal(menu.name);
  };

  return (
    <>
      <CommonModal show={showModal === 'Task'} onClose={onModalClose}>
        <TaskView onClose={onModalClose} />
      </CommonModal>
      <CommonModal show={showModal === 'LB'} onClose={onModalClose}>
        <LeaderboardView />
      </CommonModal>
      <CommonModal show={showModal === 'Invite'} onClose={onModalClose}>
        <InviteView />
      </CommonModal>
      <CommonModal show={showModal === 'BP'} onClose={onModalClose}>
        <BackPackView />
      </CommonModal>
      <CommonModal show={showModal === 'News'} onClose={onModalClose}>
        <NewsView />
      </CommonModal>
      <CommonModal show={showModal === 'Lucky'} onClose={onModalClose}>
        <LuckySpin />
      </CommonModal>
      <div className="w-full lg:h-[260px] absolute top-14 lg:top-[unset] left-0 lg:bottom-0 flex pb-12">
        <div className="pc-only w-full h-full absolute left-0 bottom-0 bg-[#80CEFF] blur-[65px] z-0"></div>
        <div className="w-full px-12 xl:w-[68%] xl:px-0 lg:mx-auto flex items-end justify-between relative z-10 gap-10">
          <div className="flex items-center lg:flex-col lg:items-start gap-10 lg:gap-0">
            <GreenId />
            <EnergyBox />
          </div>
          {!isMobile ? (
            <>
              <div className="flex-1 pb-9">
                <SearchBox />
              </div>
              <div className="flex flex-col items-end gap-18">
                <MenuMy />
                <MenuBox className="flex-row gap-16 pr-4 pb-6" menus={PublicMenus} onMenuClick={onMenuClick} />
              </div>
            </>
          ) : (
            <div className="absolute right-6 top-[120px]">
              <MenuBox className="flex-col gap-26" menus={PrivateMenus} onMenuClick={onMenuClick} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BoxBottom;
