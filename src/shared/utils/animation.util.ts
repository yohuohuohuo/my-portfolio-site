export const getPerFrameValue = (total: number, duration: number) => {
  return (total / duration) * 16;
};

export const easeOutQuad = (t: number) => {
  return t * (2 - t);
};

// 缓动函数（自定义贝塞尔曲线）
export const easing = (t: number) => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export interface TimeoutPlusProps {
  ms: number;
  callback: Function;
}

export const setTimeoutPlus = async (props: TimeoutPlusProps[]) => {
  for (let index = 0; index < props.length; index++) {
    const item = props[index];
    await delay(item.ms);
    item.callback();
  }
};
