import classNames from 'classnames';
import { FC } from 'react';
import SpinBox from './spin-box.component';
import SpinRecord from './spin-record.component';
import SpinRule from './spin-rule.component';

interface LuckySpinInterface {}

const LuckySpin: FC<LuckySpinInterface> = (props) => {
  return (
    <div
      id="lucky-spin-content"
      className={
        'w-[94vw] h-[80dvh] rounded-[26px] lg:w-full lg:h-fit lg:max-h-[94dvh] relative z-10 overflow-x-hidden overflow-y-auto no-scrollbar'
      }
    >
      <div className={classNames('w-full max-w-[900px] mx-auto flex flex-col lg:gap-8')}>
        <SpinBox />
        <div className="w-full flex gap-8 flex-col-reverse lg:flex-row bg-[#17c349] lg:bg-transparent pt-30 pb-6 px-6 lg:p-0">
          <SpinRecord />
          <SpinRule />
        </div>
      </div>
    </div>
  );
};

export default LuckySpin;
