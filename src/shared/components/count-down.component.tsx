import { formatDuring } from '@/shared/utils';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

interface CountDownInterface {
  start: number;
  end: number;
  duration: number;
  type: 'short' | 'long';
}

const fixed = (num: number) => {
  return `${num < 10 ? '0' : ''}${num}`;
};

const CountDown: FC<CountDownInterface> = (props) => {
  const requestRef = useRef<any>(null);
  const prevTime = useRef<number>(Date.now());
  const [value, setValue] = useState('');
  const totalDuration = useRef(0);

  useEffect(() => {
    totalDuration.current = props.end - props.start;
    updateValue();
  }, [props.end, props.start]);

  const updateValue = () => {
    const [days, hours, minutes, seconds, millisecond] = formatDuring(totalDuration.current);

    if (props.type === 'short') {
      const totalHours = hours + days * 24;
      setValue(`${fixed(totalHours)}:${fixed(minutes)}:${fixed(seconds)}`);
    } else {
      setValue(`${fixed(days)}:${fixed(hours)}:${fixed(minutes)}:${fixed(seconds)}`);
    }
  };

  const requestAnimationCallback = useCallback(() => {
    const now = Date.now();
    const duration = now - prevTime.current;

    if (duration >= props.duration && totalDuration.current >= 0) {
      prevTime.current = now;
      totalDuration.current = totalDuration.current - props.duration;
      updateValue();
    }
    requestRef.current = requestAnimationFrame(requestAnimationCallback);
  }, [props.duration]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(requestAnimationCallback);
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [requestAnimationCallback]);

  return <>{value}</>;
};

export default CountDown;
