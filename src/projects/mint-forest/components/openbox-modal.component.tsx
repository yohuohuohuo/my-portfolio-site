import ReactModal from 'react-modal';
import CommonImg from '@/projects/mint-forest/components/common/common-img.component';
import { CloseSvg, LeafSvg } from '@/projects/mint-forest/assets/svg';
import { FC } from 'react';
import { formatNumber } from '@/projects/mint-forest/utils';
import GoButton from './go-button.component';

interface OpenBoxModalProps {
  reward: number;
  isOpen: boolean;
  onRequestClose: () => void;
}

const OpenBoxModal: FC<OpenBoxModalProps> = ({ reward, isOpen, onRequestClose }) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick={true}
      className="bg-[#FFEFBE] rounded-[24px] pt-15 px-45 pb-18 flex flex-col items-center gap-6 max-w-[400px] outline-none relative"
      overlayClassName="absolute inset-0 bg-black bg-opacity-50 z-[100001] flex justify-center items-center"
    >
      <div
        className="w-18 h-18 lg:w-26 lg:h-26 border-[3px] border-white flex justify-center items-center bg-[#48D348] rounded-circle lg:rounded-md cursor-pointer text-white hover:brightness-110 absolute lg:-right-36 lg:top-0 right-0 -top-28"
        onClick={onRequestClose}
      >
        <CloseSvg className="w-[77%] h-[77%]" />
      </div>
      <div className="w-[200px] h-[200px]">
        <CommonImg local src="/projects/mint-forest/images/box.png" alt="Open Box" className="w-full h-full object-contain" />
      </div>
      <div className="flex items-center gap-4">
        <LeafSvg />
        <p className="text-[#00B32D] text-[28px] leading-normal font-bold">+{formatNumber(reward)}</p>
      </div>
      <GoButton text="Close" className="hover:brightness-110 cursor-pointer" onClick={onRequestClose} />
    </ReactModal>
  );
};

export default OpenBoxModal;
