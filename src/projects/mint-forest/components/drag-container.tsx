import { useGesture } from '@use-gesture/react';
import classNames from 'classnames';
import { FC, PropsWithChildren, useEffect, useRef } from 'react';
import { Lethargy } from 'lethargy-ts';

interface DragContainerInterface {
  className: string;
  minScale: number;
  maxScale: number;
  onScale: (scale: number) => void;
  onWheel: (direction: 'up' | 'down') => void;

  onMouseDown: (e: MouseEvent) => void;
  onMouseMove: (e: MouseEvent) => void;
  onMouseUp: (e: MouseEvent) => void;
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
}

const lethargy = new Lethargy();

const DragContainer: FC<DragContainerInterface & PropsWithChildren> = (props) => {
  const dragRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGlobalMouseUp = (e: any) => {
      props.onMouseUp(e);
    };
    const handler = (e: Event) => e.preventDefault();
    document.addEventListener('gesturestart', handler);
    document.addEventListener('gesturechange', handler);
    document.addEventListener('gestureend', handler);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('gesturestart', handler);
      document.removeEventListener('gesturechange', handler);
      document.removeEventListener('gestureend', handler);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  useGesture(
    {
      // onHover: ({ active, event }) => console.log('hover', event, active),
      // onMove: ({ event }) => console.log('move', event),
      onMouseDown: (state) => {
        props.onMouseDown(state.event);
        dragRootRef.current!.style.cursor = 'grabbing';
      },
      onMouseUp: (state) => {
        props.onMouseUp(state.event);
        dragRootRef.current!.style.cursor = 'grab';
      },
      // onMouseUpCapture: (state) => {
      //   props.onMouseUp(state.event);
      // },
      onMouseMove: (state) => {
        props.onMouseMove(state.event);
      },
      onTouchStart: (state) => {
        props.onTouchStart(state.event);
      },
      onTouchMove: (state) => {
        props.onTouchMove(state.event);
      },
      onTouchEnd: (state) => {
        props.onTouchEnd(state.event);
      },
      onPinch: (state) => {
        props.onScale(state.offset[0]);
      },
      onWheel: ({ direction, first, last, ...rest }) => {
        const validScroll = lethargy.check(rest.event);
        if (validScroll) {
          props.onWheel(direction[1] > 0 ? 'down' : 'up');
        }
      },
    },
    {
      target: dragRootRef,
      pinch: { scaleBounds: { min: props.minScale, max: props.maxScale }, rubberband: true },
    }
  );

  return (
    <div ref={dragRootRef} className={classNames('cursor-grab', props.className)}>
      {props.children}
    </div>
  );
};

export default DragContainer;
