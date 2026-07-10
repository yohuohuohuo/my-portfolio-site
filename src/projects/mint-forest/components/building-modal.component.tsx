import CommonImg from '@/projects/mint-forest/components/common/common-img.component';
import { BuildingTitleBgSvg } from '@/projects/mint-forest/assets/svg';
import classNames from 'classnames';
import { motion } from 'motion/react';
import { FC } from 'react';
import Modal from 'react-modal';

interface BuildingModalProps {
  buildingConfig: any;
  show: boolean;
  onClose?: () => void;
}

const BuildingModal: FC<BuildingModalProps> = ({ show, buildingConfig, onClose }) => {
  if (!buildingConfig) return <></>;

  return (
    <Modal
      isOpen={show}
      ariaHideApp={false}
      style={{
        overlay: {
          zIndex: 100000,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(6px)',
        },
        content: {
          padding: 0,
          border: 'none',
          borderRadius: 0,
          width: 'fit-content',
          height: 'fit-content',
          background: 'rgba(0,0,0,0)',
          top: 'auto',
          left: '50%',
          right: 'auto',
          bottom: '32px',
          transform: 'translateX(-50%)',
          overflow: 'hidden',
        },
      }}
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={true}
      onRequestClose={onClose}
    >
      <div className="w-[98vw] h-[400px] rounded-[40px] flex">
        <motion.div
          className="w-full h-[140px] flex flex-col items-center absolute left-0 bottom-0 rounded-[24px]"
          initial={{ opacity: 0, translateY: 1000 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            duration: 0.3,
            translateY: { type: 'spring', visualDuration: 0.3, bounce: 0.3 },
          }}
          style={{
            background: buildingConfig.bg,
          }}
        >
          <div
            className="w-[700px] h-[200px] absolute left-[62%] -translate-x-1/2 bottom-0"
            style={{
              // @ts-ignore
              '--building-tip-bg': buildingConfig.bg,
            }}
          >
            <CommonImg
              className="absolute bottom-[64px] -left-[54%]"
              local
              src={buildingConfig.icon.url}
              style={{ width: buildingConfig.icon.width }}
            />
            <BuildingTitleBgSvg className={'absolute left-1/2 -translate-x-1/2 top-0'} />
            <div className="flex flex-col w-[650px] absolute top-0 right-0 pl-10 pt-6 gap-4">
              <span
                style={{ color: buildingConfig.name.color, fontSize: buildingConfig.name.size }}
                className={classNames('font-black leading-[56px]')}
              >
                {buildingConfig.name.text}
              </span>
              <span className="text-sm leading-[22px] font-medium text-white">{buildingConfig.content}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </Modal>
  );
};

export default BuildingModal;
