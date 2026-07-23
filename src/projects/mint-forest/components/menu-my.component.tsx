import CommonImg from '@/projects/mint-forest/components/common/common-img.component';
import CommonModal from '@/projects/mint-forest/components/common/common-modal.component';
import { FC, useState } from 'react';
import PortfolioView from '../sections/views/portfolio-view';
import UnReadDot from './unread-dot.component';

interface MenuMyInterface {}

const MenuMy: FC<MenuMyInterface> = (props) => {
  const [showModal, setShowModal] = useState(false);

  const onMenuClick = () => {
    setShowModal(true);
  };

  const onModalClose = () => {
    setShowModal(false);
  };

  return (
    <>
      <CommonModal show={showModal} onClose={onModalClose}>
        <PortfolioView />
      </CommonModal>
      <div className="relative mb-14 ml-10 cursor-pointer" onClick={onMenuClick}>
        <div className="w-40 h-40 rounded-circle bg-linear-to-b from-[#00721C] to-[#00FF29] border-[3px] border-white flex items-center justify-center">
          <CommonImg local className="w-29 mb-2" src="/projects/mint-forest/images/ic-my.png" alt="" />
        </div>
        <span
          style={{ boxShadow: '0px 4px 7.5px 0px rgba(0, 0, 0, 0.25)' }}
          className="block text-xl font-semibold text-[#14651D] h-15 leading-[26px] px-6 bg-[#D0F4DE] border-2 border-[#6DF1B2] rounded-tr-[16px] rounded-bl-[16px] absolute bottom-[-14px] left-1/2 -translate-x-1/2"
        >
          My
        </span>
        <UnReadDot />
      </div>
    </>
  );
};

export default MenuMy;
