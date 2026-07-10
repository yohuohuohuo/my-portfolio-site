import { FC, useMemo, useState } from 'react';
import MenuBox, { MenuItem, PrivateMenus } from '../../components/menu-box.component';
import BackPackView from './backpack-view';
import InviteView from './invite-view';
import NewsView from './news-view';

interface PortfolioViewInterface {}

const PortfolioView: FC<PortfolioViewInterface> = (props) => {
  const [showModal, setShowModal] = useState('Invite');

  const onMenuClick = (menu: MenuItem) => {
    setShowModal(menu.name);
  };

  const activeView = useMemo(() => {
    switch (showModal) {
      case 'Invite':
        return <InviteView />;
      case 'BP':
        return <BackPackView />;
      case 'News':
        return <NewsView />;
      default:
        return <></>;
    }
  }, [showModal]);

  return (
    <div className="w-full flex flex-col gap-8">
      <div
        className="w-full h-[124px] bg-background-lv1 rounded-[32px] p-10 flex items-end"
        style={{ boxShadow: '0px 2px 4px 0px rgba(255, 255, 255, 0.50) inset, 0px -4px 2px 0px #215994 inset' }}
      >
        <MenuBox className="flex-row gap-16" menus={PrivateMenus} onMenuClick={onMenuClick} defaultActive="Invite" />
      </div>
      {activeView}
    </div>
  );
};

export default PortfolioView;
