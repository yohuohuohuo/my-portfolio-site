import CommonImg from '@/shared/components/common-img.component';
import { isEmpty } from '@/shared/utils';
import { motion } from 'motion/react';
import { FC, useEffect, useRef, useState } from 'react';

interface CloudInterface {
  index: number;
  item: any;
  opend?: boolean;
  totalCount: number;
}

const Cloud: FC<CloudInterface> = ({ index, item, opend, totalCount }) => {
  const [animationEnd, setAnimationEnd] = useState(false);
  const [animate, setanimate] = useState<any>({ translateX: 0, translateY: 0, opacity: 1, scale: 1 });
  const timer = useRef<any>(null);

  useEffect(() => {
    if (!opend || !totalCount || isEmpty(index)) {
      setAnimationEnd(false);
      setanimate({ translateX: 0, translateY: 0, opacity: 1, scale: 1 });
      timer.current && clearTimeout(timer.current);
      return;
    }
    const radius = 100; // 散开半径
    const totalAngle = 360; // 扇形角度范围（如120度）

    const angleStep = totalAngle / totalCount;
    const currentAngle = index * angleStep - totalAngle / 2;

    const x = radius * Math.cos((currentAngle * Math.PI) / 180);
    const y = radius * Math.sin((currentAngle * Math.PI) / 180);

    setanimate({ translateX: `${x}vw`, translateY: `${y}vh`, opacity: 0, scale: 2.5 });

    timer.current = setTimeout(() => {
      setAnimationEnd(true);
    }, 4300);

    return () => {
      timer.current && clearTimeout(timer.current);
      timer.current = null;
    };
  }, [opend, totalCount]);

  if (animationEnd || !item) {
    return <></>;
  }

  return (
    <motion.div
      className="absolute"
      key={index}
      style={{
        left: `${item.x}px`,
        top: `${item.y}px`,
      }}
      transition={{ duration: 4, type: 'spring', bounce: 0 }}
      animate={animate}
    >
      <CommonImg
        local
        className="h-auto select-none"
        src={`/images/${item.type}.png`}
        alt="cloud"
        style={{
          width: `${item.w}px`,
        }}
        data-index={index}
        draggable={false}
      />
    </motion.div>
  );
};

export default Cloud;
