import { BaseModalStyle } from '@/projects/mint-forest/config/modal.config';
import { IRightSvg } from '@/projects/mint-forest/assets/svg';
import { FC } from 'react';
import ReactModal from 'react-modal';
import { motion } from 'motion/react';
import { useMobile } from '@/projects/mint-forest/hooks';
import { formatNumber } from '@/projects/mint-forest/utils';
import GoButton from '../../components/go-button.component';

interface TaskResultViewProps {
  show: boolean;
  reward?: number;
  onClose: () => void;
}

const TaskResultView: FC<TaskResultViewProps> = ({ show, reward, onClose }) => {
  const { isMobile } = useMobile();

  return (
    <ReactModal
      isOpen={show}
      ariaHideApp={false}
      style={BaseModalStyle}
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={true}
      onRequestClose={onClose}
    >
      <div className="w-[96vw] lg:w-[960px] rounded-[40px] flex gap-8 py-24 px-10 lg:p-19">
        <motion.div
          className="w-full h-full flex flex-col items-center relative"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            scale: { type: 'spring', visualDuration: 0.3, bounce: isMobile ? 0.2 : 0.45 },
          }}
        >
          <div
            className="w-[94vw] h-[40vh] lg:w-full lg:h-[44vh] bg-background-lv1 rounded-[20px] lg:rounded-[40px] p-10 flex flex-col items-start"
            style={{ boxShadow: '0px 2px 4px 0px rgba(255, 255, 255, 0.50) inset, 0px -4px 2px 0px #215994 inset' }}
          >
            <div
              className="w-full h-full flex flex-col bg-[#FFEFBE] rounded-[24px] p-8 items-center justify-center gap-6"
              style={{
                boxShadow:
                  '0px 4px 2px 0px #FFF inset, 0px 3px 6px 0px rgba(0, 0, 0, 0.30), 0px -4px 2px 0px #DEAE7B inset',
              }}
            >
              <IRightSvg />
              <p className="text-[#60C61B] text-[20px] font-bold">Completed the task</p>
              <p className="text-[#A45118] text-[36px] font-bold">+{formatNumber(reward)} MF</p>
              <GoButton text="Close" className="cursor-pointer hover:brightness-110" onClick={onClose} />
            </div>
          </div>
        </motion.div>
      </div>
    </ReactModal>
  );
};

export default TaskResultView;
