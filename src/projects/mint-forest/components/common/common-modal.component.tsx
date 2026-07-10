import { BaseModalStyle } from '@/projects/mint-forest/config/modal.config';
import { motion } from 'motion/react';
import { FC, PropsWithChildren } from 'react';
import Modal from 'react-modal';
import { useMobile } from '../../hooks';
import { CloseSvg } from '../../assets/svg';

interface CommonModalProps {
  show: boolean;
  hideClose?: boolean;
  onClose?: () => void;
}

const CommonModal: FC<CommonModalProps & PropsWithChildren> = ({ show, hideClose, children, onClose }) => {
  const { isMobile } = useMobile();

  return (
    <Modal
      isOpen={show}
      ariaHideApp={false}
      style={BaseModalStyle}
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={true}
      onRequestClose={onClose}
    >
      <div className="w-[96vw] xl:w-[1100px] rounded-[40px] flex gap-8 py-24 px-10 lg:p-19">
        <motion.div
          className="w-full h-full flex flex-col items-center relative"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            scale: { type: 'spring', visualDuration: 0.3, bounce: isMobile ? 0.2 : 0.45 },
          }}
        >
          {children}
        </motion.div>
        {!hideClose && (
          <div
            className="flex-shrink-0 w-18 h-18 lg:w-26 lg:h-26 border-[3px] border-white flex justify-center items-center bg-[#48D348] rounded-circle lg:rounded-md cursor-pointer text-white hover:brightness-110 absolute lg:static right-10 top-0"
            onClick={onClose}
          >
            <CloseSvg className="w-[77%] h-[77%]" />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CommonModal;
