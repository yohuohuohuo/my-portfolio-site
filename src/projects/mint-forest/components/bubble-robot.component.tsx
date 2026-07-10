/* eslint-disable @next/next/no-img-element */
import CommonImg from '@/shared/components/common-img.component';
import { BubbleSvg, MintSmalllogoSvg } from '@/shared/svg';
import { formatNumber } from '@/shared/utils';
import classNames from 'classnames';
import { random } from 'lodash';
import { FC, useEffect, useState } from 'react';

interface BubbleRobotInterface {
  className?: string;
  count: number;
  collecting: boolean;
  amount: number;
}

const BubbleRobot: FC<BubbleRobotInterface> = (props) => {
  const [randomBubble, setRandomBubble] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  const updateBubble = () => {
    if (!props.collecting) {
      return;
    }

    let list = [];

    let angle = Math.random() * 2 * Math.PI;
    for (let index = 0; index < props.count; index++) {
      angle = angle + (2 * Math.PI) / random(8, 12);
      const radius = random(100, 150);
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      list.push({ x, y, angle });
    }

    list = list
      .sort(() => 0.5 - Math.random())
      .map((item, index) => {
        const delay = random(index, index + 3) * 1000;
        const duration = (3000 + random(index * 5, index * 5 + 10) * 200) * 2;
        return { ...item, delay, duration };
      });
    setRandomBubble(list);
  };

  useEffect(() => {
    updateBubble();
  }, [props.collecting, props.count]);

  return (
    <div className={classNames('relative', props.className)}>
      <CommonImg
        local
        src="/projects/mint-forest/images/bubble-robot.gif"
        className="w-full h-full scale-[1.2]"
        alt=""
        onLoad={() => {
          setLoaded(true);
        }}
      />

      <span className="text-sm lg:text-base font-semibold absolute -bottom-8 lg:-bottom-12 translate-x-[-50%] left-[50%] text-nowrap">
        {loaded && props.collecting ? 'Collecting automatically...' : `collect today's referrals`}
      </span>
      <span className="text-md lg:text-[28px] font-medium font-DINCond absolute -bottom-20 lg:-bottom-27 translate-x-[-50%] left-[50%] text-nowrap">
        {props.amount == 1 ? 0 : formatNumber(props.amount)}
      </span>

      {loaded &&
        randomBubble.map((item, index) => {
          return (
            <div
              key={index}
              className="w-full h-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                // @ts-ignore
                '--auto-bubble-delay': `${item.delay}ms`,
                '--auto-bubble-duration': `${item.duration}ms`,
                '--auto-bubble-x': `${item.x}px`,
                '--auto-bubble-y': `${item.y}px`,
              }}
            >
              <div className="auto-bubble relative text-black">
                <BubbleSvg className="w-full h-full absolute left-0 top-0 z-10" />
                <img
                  className="w-full h-full absolute left-0 top-0 z-20"
                  src={'/projects/mint-forest/images/ic-bubble-light.png'}
                  alt=""
                />
                <MintSmalllogoSvg
                  className={
                    'w-[42%] h-[42%] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 opacity-35'
                  }
                />
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default BubbleRobot;
