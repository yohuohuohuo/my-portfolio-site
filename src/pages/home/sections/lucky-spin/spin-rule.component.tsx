import classNames from 'classnames';
import { FC, useState } from 'react';

interface SpinRuleInterface {}

const rules = [
  '1. Daily Spins: Users can spin the wheel up to 5 times per day, with no time restrictions.',
  '2. Cost per Spin: Each spin costs 100 MF.',
  "3. Winning Prizes: The wheel has 6 different sectors, each offering varying amounts of MF. When the wheel stops at a particular MF value, the user immediately receives that amount of MF added into the user's MF Pool.",
  'Join the excitement of the Mint Forest Lucky Spin and boost your MF earnings today! 🍀',
];

const SpinRule: FC<SpinRuleInterface> = (props) => {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl relative overflow-hidden">
      <div className="w-full h-[400px] bg-leaderboard-bg absolute left-0 top-0 z-0 rounded-t-md"></div>
      <span className="w-full h-21 leading-[42px] px-14 bg-[#BBFF72] text-md text-[#1F4E00] font-semibold relative z-10">
        Rules
      </span>
      <div
        className={classNames(
          'max-h-[132px] overflow-hidden lg:max-h-[unset] lg:h-[500px] lg:overflow-auto relative z-10 flex flex-col px-14 transition-all pb-[70px] lg:pb-0',
          { '!max-h-[800px]': showMore }
        )}
      >
        <span className="text-[#495E4E] text-base leading-[24px] mb-12 mt-7">
          Welcome to the Mint Forest Lucky Spin! Are you feeling lucky? Test your fortune and win Mint Forest Energy
          (MF) rewards with every spin!
        </span>
        <span className="text-[#1C3522] text-base leading-[24px] font-bold mb-2">Game Rules:</span>
        {rules.map((item, index) => {
          return (
            <span key={index} className="text-[#495E4E] text-base leading-[24px] mb-8">
              {item}
            </span>
          );
        })}
        <div
          className={classNames(
            'h-[50px] w-full flex items-center justify-center absolute left-0 bottom-0 bg-gradient-to-b from-[#e6fed1] to-[#FFF] transition-all cursor-pointer lg:hidden',
            {
              '!from-[#FFF]': showMore,
            }
          )}
          onClick={() => setShowMore((current) => !current)}
        >
          <span className="text-[14px] text-[#A6B4A6]">{!showMore ? 'View More' : 'View Less'}</span>
        </div>
      </div>
    </div>
  );
};

export default SpinRule;
