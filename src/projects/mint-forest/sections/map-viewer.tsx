import LoadMore from '@/shared/components/loadmore/loadmore.component';
import { AreaRect } from '@/shared/const/scene.const';
import { useCurrentLevel, useGlobalStore, usePreloadImg, useResize } from '@/shared/hooks';
import { easeOutQuad, getPerFrameValue, setTimeoutPlus } from '@/shared/utils/animation.util';
import { covetPoint, getRandomBird } from '@/shared/utils/business/map.helper';
import { clamp, random } from 'lodash';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Two from 'two.js';
import { Sprite } from 'two.js/src/effects/sprite';
import { Group } from 'two.js/src/group';
import DragContainer from '../components/drag-container';
import MapElement from './map-element';

interface MapViewerProps {
  onDrawComplete: () => void;
}

const Config = {
  MAX_ZOOM: 1,
  DECAY: 0.86,
  OverflowScale: 0.05,
};

const MapViewer = (props: MapViewerProps) => {
  const { pageStatus } = useGlobalStore();
  const twoRef = useRef<Two>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const groupRef = useRef<Group>(null);
  const minZoom = useRef(0.5);
  const [minScale, setMinScale] = useState(0.5);
  const currentLevel = useCurrentLevel();

  const preload = usePreloadImg();

  const containerRef = useRef<HTMLDivElement>(null);
  const mapElementRef = useRef<HTMLDivElement>(null);

  // 鼠标事件处理
  const lastPos = useRef({ x: 0, y: 0 });
  const touchMoveDistance = useRef(0);
  const lastTime = useRef(0);

  // 动画参数
  const animParams = useRef({
    dragging: false,
    velocity: { x: 0, y: 0 },
    isRebounding: false,
  });

  const currentArea = useMemo(() => {
    return AreaRect[currentLevel - 1];
  }, [currentLevel]);

  useResize(() => {
    mapResize();
  }, [currentArea]);

  useEffect(() => {
    if (!containerRef.current) return;

    mapInit();

    return () => {
      twoRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (pageStatus === 'complete' && currentArea && currentArea.building) {
      foucsTo(currentArea.building.mapX, currentArea.building.mapY, minZoom.current * 1.6);
    }
  }, [pageStatus, currentArea]);

  const mapInit = async () => {
    if (!containerRef.current) return;

    // 初始化 Two.js
    const two = new Two({
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      autostart: true,
      ratio: window.devicePixelRatio || 1,
      type: Two.Types.canvas,
    }).appendTo(containerRef.current);

    twoRef.current = two;
    groupRef.current = two.makeGroup();

    await initMapBg();
    initBridLight();

    props.onDrawComplete();

    setTimeoutPlus([
      {
        ms: 200,
        callback: () => {
          foucsTo(0, 0, minZoom.current, 800);
        },
      },
    ]);
  };

  const initMapBg = async () => {
    // 创建图片元素
    imgRef.current = (await preload(['/projects/mint-forest/images/map/map.jpg']))[0];

    if (!groupRef.current || !imgRef.current || !twoRef.current) return;
    minZoom.current = calculateMinScale();
    setMinScale(minZoom.current);

    // 创建矩形作为图片容器
    const rect = twoRef.current.makeRectangle(0, 0, imgRef.current.naturalWidth, imgRef.current.naturalHeight);
    rect.fill = new Two.Texture(imgRef.current);
    rect.noStroke();

    groupRef.current.add(rect as any);
  };

  const initBridLight = () => {
    if (!groupRef.current || !imgRef.current || !twoRef.current) return;
    const birds: { bird: Sprite; d: number }[] = [];

    for (let index = 0; index < 10; index++) {
      const { x, y, d } = getRandomBird(imgRef.current.naturalWidth, imgRef.current.naturalHeight);
      const bird = new Two.Sprite('/projects/mint-forest/images/map/bird.png', x, y, 22, 1, random(3, 10));
      bird.play();
      birds.push({ bird, d: Math.abs(d) != 1 ? 0 : d });
    }

    groupRef.current.add(birds.map((item) => item.bird) as any);
    twoRef.current.bind('update', () => {
      birds.forEach((item) => {
        if (!imgRef.current) {
          return;
        }
        const { bird, d } = item;
        // 更新位置
        bird.translation.add(new Two.Vector(random(1, 3), d));

        // 边界反弹
        if (bird.translation.x > imgRef.current.naturalWidth / 2) {
          const { x, y } = getRandomBird(imgRef.current.naturalWidth, imgRef.current.naturalHeight, true);
          bird.translation.set(x, y);
        }
      });

      if (twoRef.current) {
        twoRef.current.render(); // 手动触发渲染
      }
    });
  };

  const mapResize = () => {
    if (!containerRef.current || !twoRef.current) return;

    const two = twoRef.current;
    two.width = containerRef.current.clientWidth;
    two.height = containerRef.current.clientHeight;
    two.renderer.setSize(two.width, two.height);

    minZoom.current = calculateMinScale();
    setMinScale(minZoom.current);

    setTimeoutPlus([
      {
        ms: 200,
        callback: () => {
          if (currentArea && currentArea.building && pageStatus !== 'login') {
            foucsTo(currentArea.building.mapX, currentArea.building.mapY, minZoom.current * 1.6);
          } else {
            foucsTo(0, 0, minZoom.current);
          }
        },
      },
    ]);

    two.update();
  };

  const onMouseDown = (e: MouseEvent) => {
    animParams.current.dragging = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    lastTime.current = Date.now();
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!animParams.current.dragging || !groupRef.current) return;

    const deltaX = e.clientX - lastPos.current.x;
    const deltaY = e.clientY - lastPos.current.y;

    groupRef.current.translation.x += deltaX;
    groupRef.current.translation.y += deltaY;

    const now = Date.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      animParams.current.velocity.x = getPerFrameValue(deltaX, dt);
      animParams.current.velocity.y = getPerFrameValue(deltaY, dt);
    }

    lastPos.current = { x: e.clientX, y: e.clientY };
    lastTime.current = now;
    clampPosition(true);
  };

  const onMouseUp = () => {
    touchMoveDistance.current = 0;
    animParams.current.dragging = false;

    startInertia();

    // reboundToBounds();
  };

  const handleWheel = (direction: 'up' | 'down') => {
    // e.preventDefault();
    if (!groupRef.current || !containerRef.current || !twoRef.current) return;
    const oldScale = groupRef.current.scale as any;

    // 缩放系数
    const delta = direction == 'down' ? 0.8 : 1.2;
    const targetScale = oldScale * delta;

    scaleTo(targetScale);
  };

  const onScale = (targetScale: number) => {
    scaleTo(targetScale);
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      animParams.current.dragging = true;
      lastPos.current = { x: touch.clientX, y: touch.clientY };
      lastTime.current = Date.now();
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1 && animParams.current.dragging) {
      const touch = e.touches[0];
      onMouseMove(touch as any);
    }
  };

  const getLimitBounds = (strictBounds: boolean) => {
    if (!twoRef.current || !imgRef.current || !groupRef.current) return null;

    const scale = groupRef.current.scale as any;
    const imgWidth = imgRef.current.naturalWidth * scale;
    const imgHeight = imgRef.current.naturalHeight * scale;
    const { width: containerWidth, height: containerHeight } = twoRef.current;

    // X轴边界计算
    let maxX = 0,
      minX = 0;
    if (imgWidth > containerWidth) {
      maxX = imgWidth / 2;
      minX = -((imgWidth - containerWidth) / 2 - containerWidth / 2);
    }

    // Y轴边界计算
    let maxY = 0,
      minY = 0;
    if (imgHeight > containerHeight) {
      maxY = imgHeight / 2;
      minY = -((imgHeight - containerHeight) / 2 - containerHeight / 2);
    }

    // 预留边界
    if (!strictBounds) {
      maxX *= 1 - Config.OverflowScale;
      maxY *= 1 - Config.OverflowScale;

      minY *= 1 + Config.OverflowScale;
      minX *= 1 + Config.OverflowScale;
    }

    return { minX, maxX, minY, maxY };
  };

  // 边界限制计算
  const clampPosition = (strictBounds: boolean) => {
    if (!twoRef.current || !imgRef.current || !groupRef.current) return;

    const bounds = getLimitBounds(strictBounds);
    if (!bounds) return;
    const { minX, maxX, minY, maxY } = bounds;

    const x = Math.min(Math.max(groupRef.current.translation.x, minX), maxX);
    const y = Math.min(Math.max(groupRef.current.translation.y, minY), maxY);

    groupRef.current.translation.set(x, y);

    updateSyncAnimate();
  };

  const reboundToBounds = () => {
    if (!groupRef.current || !twoRef.current || !imgRef.current || animParams.current.isRebounding) return;
    const bounds = getLimitBounds(false);
    if (!bounds) return;
    const { minX, maxX, minY, maxY } = bounds;
    const currentX = groupRef.current.translation.x;
    const currentY = groupRef.current.translation.y;
    let targetX = currentX;
    let targetY = currentY;
    // 计算目标位置
    if (currentX < minX) {
      targetX = minX;
    } else if (currentX > maxX) {
      targetX = maxX;
    }
    if (currentY < minY) {
      targetY = minY;
    } else if (currentY > maxY) {
      targetY = maxY;
    }
    if (targetX === currentX && targetY === currentY) {
      animParams.current.isRebounding = false;
      startInertia();
      return;
    }
    animParams.current.isRebounding = true;
    // 启动回弹动画
    const startTime = Date.now();
    const duration = 300;
    const animate = () => {
      const progress = (Date.now() - startTime) / duration;
      if (progress < 1) {
        const t = easeOutQuad(progress);
        const newX = currentX + (targetX - currentX) * t;
        const newY = currentY + (targetY - currentY) * t;
        groupRef.current!.translation.set(newX, newY);
        updateSyncAnimate();
        requestAnimationFrame(animate);
      } else {
        groupRef.current!.translation.set(targetX, targetY);
        updateSyncAnimate();
        animParams.current.isRebounding = false;
        startInertia();
      }
    };
    animate();
  };

  // 惯性动画
  const startInertia = () => {
    const decay = Config.DECAY;
    const animate = () => {
      if (
        !animParams.current.dragging &&
        (Math.abs(animParams.current.velocity.x) > 0.1 || Math.abs(animParams.current.velocity.y) > 0.1)
      ) {
        animParams.current.velocity.x *= decay;
        animParams.current.velocity.y *= decay;

        if (groupRef.current) {
          groupRef.current.translation.x += animParams.current.velocity.x;
          groupRef.current.translation.y += animParams.current.velocity.y;
          clampPosition(true);
        }

        requestAnimationFrame(animate);
      }
    };
    animate();
  };

  const addCheckPoint = (x: number, y: number) => {
    if (!twoRef.current || !groupRef.current) return;
    const dot = twoRef.current.makeRectangle(x, y, 20, 20);
    dot.fill = '#FF0000';
    dot.noStroke();
    groupRef.current.add(dot as any);
    twoRef.current.update();
  };

  const scaleTo = (targetScale: number) => {
    if (!groupRef.current || !containerRef.current || !twoRef.current) return;

    const clampedScale = clamp(targetScale, minZoom.current, Config.MAX_ZOOM);

    const startTime = Date.now();
    const startScale = groupRef.current.scale as any;
    const animate = () => {
      if (!groupRef.current) return;

      const progress = (Date.now() - startTime) / 300;

      if (progress < 1) {
        // 使用缓动函数
        const t = easeOutQuad(progress);
        groupRef.current.scale = startScale + (clampedScale - startScale) * t;

        clampPosition(true);
        requestAnimationFrame(animate);
      } else {
        // 确保最终位置准确
        groupRef.current.scale = clampedScale;
        clampPosition(true);
      }
    };

    animate();
  };

  const foucsTo = (x: number, y: number, scale: number, duration?: number, onFinish?: () => void) => {
    if (!twoRef.current || !groupRef.current) return;

    // 动画参数
    const animation = {
      duration: duration || 800, // 动画时长
      startTime: Date.now(),
      startX: groupRef.current.translation.x,
      startY: groupRef.current.translation.y,
      startScale: groupRef.current.scale as any,
      targetScale: scale,
    };

    // 计算目标平移量（将点击点移动到画布中心）
    const targetTX = twoRef.current.width / 2 - x * animation.targetScale;
    const targetTY = twoRef.current.height / 2 - y * animation.targetScale;

    // 动画帧函数
    const animate = () => {
      if (!groupRef.current) return;

      const progress = (Date.now() - animation.startTime) / animation.duration;

      if (progress < 1) {
        // 缓动函数
        const t = easeOutQuad(progress);
        groupRef.current.scale = animation.startScale + (animation.targetScale - animation.startScale) * t;
        groupRef.current.translation.x = animation.startX + (targetTX - animation.startX) * t;
        groupRef.current.translation.y = animation.startY + (targetTY - animation.startY) * t;

        clampPosition(true);
        requestAnimationFrame(animate);
      } else {
        // 确保最终位置准确
        groupRef.current.translation.set(targetTX, targetTY);
        groupRef.current.scale = animation.targetScale;
        clampPosition(true);

        onFinish && onFinish();
      }
    };

    animate();
  };

  const updateSyncAnimate = () => {
    if (!groupRef.current || !twoRef.current) return;

    const scale = groupRef.current.scale as number;
    const x = groupRef.current.translation.x;
    const y = groupRef.current.translation.y;

    const covert = covetPoint(x, y, twoRef.current.width, twoRef.current.height, 1);

    if (mapElementRef.current) {
      mapElementRef.current.style.transform = `translate(${covert.x * -1}px,${covert.y * -1}px) scale(${scale})`;
    }
  };

  // 在组件内添加计算最小缩放比例的函数
  const calculateMinScale = (): number => {
    if (!containerRef.current || !imgRef.current) return 0.5;

    // 获取容器和图片的尺寸
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const imgWidth = imgRef.current.naturalWidth;
    const imgHeight = imgRef.current.naturalHeight;

    // 计算两个方向的适配比例
    const widthRatio = containerWidth / imgWidth;
    const heightRatio = containerHeight / imgHeight;

    return Math.max(widthRatio, heightRatio) * 1.08;
  };

  const onMapClick = (e: any) => {
    if (!twoRef.current || !groupRef.current || !imgRef.current) return;
    const two = twoRef.current;
    const scale = groupRef.current.scale as any;
    const rect = two.renderer.domElement.getBoundingClientRect();
    const x = (e.clientX - rect.left - groupRef.current.translation.x) / scale;
    const y = (e.clientY - rect.top - groupRef.current.translation.y) / scale;

    // addCheckPoint(x, y);

    // console.log('Clicked at:', {
    //   x,
    //   y,
    //   scale,
    //   translation: { x: groupRef.current.translation.x, y: groupRef.current.translation.y },
    // });
  };

  return (
    <div onClick={onMapClick} className="w-full h-full overflow-hidden bg-blue-400 relative">
      <div ref={containerRef} className="w-full h-full"></div>
      <DragContainer
        className="w-full h-full absolute left-0 top-0 overflow-hidden touch-none"
        minScale={minScale}
        maxScale={Config.MAX_ZOOM}
        onScale={onScale}
        onWheel={handleWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={onMouseUp}
      >
        <MapElement ref={mapElementRef} />
      </DragContainer>
      <AnimatePresence>
        {pageStatus === 'loading' && (
          <motion.div
            className={'w-full h-full absolute left-0 top-0 bg-blue-400 z-50 flex items-center justify-center'}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LoadMore className="!w-[56px]" color="#FFF" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapViewer;
