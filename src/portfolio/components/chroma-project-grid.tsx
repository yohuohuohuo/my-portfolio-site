'use client';

import { gsap } from 'gsap';
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import styles from '../styles/chroma-project-grid.module.css';

interface ChromaProjectGridProps {
  children: ReactNode;
}

type Setter = (value: number) => void;

function useChromaEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const update = () => setEnabled(mediaQuery.matches);

    update();
    mediaQuery.addEventListener('change', update);

    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return enabled;
}

export default function ChromaProjectGrid({ children }: ChromaProjectGridProps) {
  const rootRef = useRef<HTMLElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const setX = useRef<Setter | null>(null);
  const setY = useRef<Setter | null>(null);
  const position = useRef({ x: 0, y: 0 });
  const enabled = useChromaEnabled();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) {
      return;
    }

    setX.current = gsap.quickSetter(root, '--x', 'px') as Setter;
    setY.current = gsap.quickSetter(root, '--y', 'px') as Setter;

    const bounds = root.getBoundingClientRect();
    position.current = { x: bounds.width / 2, y: bounds.height / 2 };
    setX.current(position.current.x);
    setY.current(position.current.y);

    return () => {
      gsap.killTweensOf(position.current);
      gsap.killTweensOf(fadeRef.current);
      setX.current = null;
      setY.current = null;
    };
  }, [enabled]);

  const moveTo = (x: number, y: number) => {
    gsap.to(position.current, {
      duration: 0.45,
      ease: 'power3.out',
      overwrite: true,
      x,
      y,
      onUpdate: () => {
        setX.current?.(position.current.x);
        setY.current?.(position.current.y);
      },
    });
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!enabled || !rootRef.current) {
      return;
    }

    const bounds = rootRef.current.getBoundingClientRect();
    moveTo(event.clientX - bounds.left, event.clientY - bounds.top);
    gsap.to(fadeRef.current, { duration: 0.25, opacity: 0, overwrite: true });
  };

  const handlePointerLeave = () => {
    if (!enabled) {
      return;
    }

    gsap.to(fadeRef.current, { duration: 0.6, opacity: 1, overwrite: true });
  };

  const gridStyle = {
    '--radius': '300px',
    '--x': '50%',
    '--y': '50%',
  } as CSSProperties;

  return (
    <section
      ref={rootRef}
      aria-label="Projects"
      className={styles.grid}
      data-chroma-enabled={enabled ? 'true' : undefined}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={gridStyle}
    >
      {children}
      {enabled ? <div className={styles.chromaMask} data-testid="chroma-base-mask" aria-hidden="true" /> : null}
      {enabled ? <div ref={fadeRef} className={styles.chromaFade} aria-hidden="true" /> : null}
    </section>
  );
}
