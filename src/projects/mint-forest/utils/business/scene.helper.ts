import { AreaRect } from '@/projects/mint-forest/config/scene.config';
import { clone, random, round } from 'lodash';
import { CSSProperties } from 'react';
import { isEmpty } from '../common.util';

export const STANDARD_SCREEN = { width: 1920, height: 1039 };

export const getScaleValue = (clientWidth: number, value: number, min?: number, max?: number): number => {
  const nextVal = clientWidth / (STANDARD_SCREEN.width / value);

  if (max && !min) {
    return Math.min(max, nextVal);
  }

  if (min && !max) {
    return Math.max(min, nextVal);
  }

  if (min && max) {
    if (nextVal >= min && nextVal < max) {
      return nextVal;
    }

    if (nextVal < min) {
      return min;
    }

    if (nextVal >= max) {
      return max;
    }
  }

  return nextVal;
};

export const getScaleObject = (obj: any, defaultValue: number, handle: Function): any => {
  if (!obj) return null;

  if (Array.isArray(obj)) {
    return obj.map((item: any) => getScaleObject(item, defaultValue, handle));
  }

  const result: any = {};
  for (const key in obj) {
    if (typeof obj[key] === 'number') {
      result[key] = obj[key] === -1 ? defaultValue : handle(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (Array.isArray(obj[key])) {
        result[key] = obj[key].map((item: any) => getScaleObject(item, defaultValue, handle));
      } else {
        result[key] = getScaleObject(obj[key], defaultValue, handle);
      }
    } else {
      result[key] = obj[key];
    }
  }

  return result;
};

function isOverlap(current: any, existingBubbles: any[]) {
  for (const item of existingBubbles) {
    if (
      current.x < item.x + item.w &&
      current.x + current.w > item.x &&
      current.y < item.y + item.h &&
      current.y + current.h > item.y
    ) {
      return true; // Overlapping
    }
  }
  return false; // Not overlapping
}

function getRandomBubble(allBubbles: any[]) {
  const randomIndex = random(0, allBubbles.length - 1);
  const current = allBubbles[randomIndex];
  return [randomIndex, current];
}

function getAllBubbles(lv: number, existed: any[], randomOffset: boolean, checkOverlap: boolean) {
  if (!AreaRect[lv - 1]) return [];

  const { width, height, building } = AreaRect[lv - 1];

  const bubbleSizeW = 100;
  const bubbleSizeH = 124;

  const countX = Math.floor(width / bubbleSizeW);
  const countY = Math.floor(height / bubbleSizeH);

  const startX = countX > 9 ? 2 : 0;
  const endX = countX > 9 ? countX - 2 : countX;

  let allBubbles: any[] = [];
  for (let x = startX; x < endX; x++) {
    for (let y = 1; y < countY; y++) {
      const offsetX = !randomOffset ? 0 : random(bubbleSizeW / 4, bubbleSizeW / 2);
      const offsetY = !randomOffset ? 0 : random(bubbleSizeH / 4, bubbleSizeH / 2);
      const current = {
        x: x * bubbleSizeW + offsetX,
        y: y * bubbleSizeH + offsetY,
        w: bubbleSizeW,
        h: bubbleSizeH,
      };
      allBubbles.push(current);
    }
  }
  if (checkOverlap) {
    const limitArea = existed;
    if (building) {
      limitArea.push({ x: building.left, y: building.top, w: building.width, h: building.height });
    }
    allBubbles = allBubbles.filter((item) => !isOverlap(item, limitArea));
  }

  return allBubbles;
}

export function generateBubbles(lv: number, count: number, existed: any[]) {
  if (count <= 0) {
    return [];
  }

  let allBubbles: any[] = getAllBubbles(lv, existed, true, true);
  if (isEmpty(allBubbles)) {
    allBubbles = getAllBubbles(lv, existed, true, false);
  }

  if (allBubbles.length < count) {
    allBubbles.concat(allBubbles);
  }

  const finalBubbles = clone(allBubbles);

  const result = [];
  for (let index = 0; index < count; index++) {
    const [deleteIndex, item] = getRandomBubble(finalBubbles);
    result.push(item);
    finalBubbles.splice(deleteIndex, 1);
  }

  return result;
}

function getDelta(positive?: boolean) {
  if (positive) return 1;
  return Math.random() > 0.5 ? 1 : -1;
}

export function generateClouds(lv: number) {
  if (!AreaRect[lv - 1]) return [];

  const {
    cloud: { width: cloudWidth, height: cloudHeight, offset },
  } = AreaRect[lv - 1];

  const densityX = 4;
  const densityY = 4;

  const minWidth = cloudWidth / densityX;
  const minHeight = cloudHeight / densityY;

  let allClouds: any[] = [];
  for (let x = 0; x < densityX; x++) {
    for (let y = 0; y < densityY; y++) {
      const scale = 1 + (random(0, 3) / 10) * getDelta();
      const currentW = round(cloudWidth * scale);

      const randomX = random(offset.x.min, offset.x.max);
      const offsetX = x == 0 ? random(currentW / 4, currentW / 3) * -1 : randomX;
      const offsetY = random(offset.y.min, offset.y.max);

      const current = {
        w: round(cloudWidth * scale),
        x: round(x * minWidth + offsetX),
        y: round(y * minHeight + offsetY),
        type: `cloud${random(1, 3)}`,
      };
      allClouds.push(current);
    }
  }

  return allClouds;
}

export function convertToBubble(bubble: any, energyItem: any) {
  return {
    style: {
      left: `${bubble.x}px`,
      top: `${bubble.y}px`,
      width: `${bubble.w}px`,
      height: `${bubble.w}px`,
      animationDelay: `${Math.floor(random(5, 15)) * 100}ms`,
    },
    data: energyItem,
  };
}

export function areaToStyle(area: any) {
  const style: CSSProperties = {
    width: area.width,
    height: area.height,
  };

  if (!isEmpty(area.left)) {
    style.left = area.left;
  }
  if (!isEmpty(area.right)) {
    style.right = area.right;
  }
  if (!isEmpty(area.bottom)) {
    style.bottom = area.bottom;
  }
  if (!isEmpty(area.top)) {
    style.top = area.top;
  }

  return style;
}

export function getAreaByLv(lv: number) {
  const item = AreaRect.find((item) => item.lv == lv);
  return item;
}
