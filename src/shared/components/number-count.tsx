import { FC, HTMLAttributes, useEffect, useRef } from 'react';
import { useCountUp } from 'react-countup';
import { formatNumber } from '../utils';

interface NumberCountInterface {
  number: number;
}

const NumberCount: FC<NumberCountInterface & HTMLAttributes<HTMLSpanElement>> = ({ number, ...props }) => {
  const countUpRef = useRef<HTMLSpanElement>(null);
  const count = useRef<number>(0);
  const { update } = useCountUp({
    ref: countUpRef as any,
    start: count.current,
    end: number,
    startOnMount: true,
    duration: 0.6,
    formattingFn: formatNumber,
  });

  useEffect(() => {
    count.current = number;
    update(count.current);
  }, [number]);

  return <span {...props} ref={countUpRef}></span>;
};

export default NumberCount;
