'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type KeyboardEvent } from 'react';
import './PixelSwap.css';

const MAX_PIXELS = 1200;
const KEYFRAME_STEPS = 14;

type Pattern = 'random' | 'center' | 'edges' | 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top' | 'diagonal' | 'spiral';
type Trigger = 'hover' | 'click' | 'manual';

type Pixel = { id: number; left: number; top: number; offset: number };
type Grid = { pixels: Pixel[]; size: number; gap: number; width: number; height: number };
type Transition = { to: boolean; grid: Grid };

type PixelSwapProps = {
  firstContent: ReactNode;
  secondContent: ReactNode;
  pixelSize?: number;
  gap?: number;
  pixelRadius?: number;
  pixelSpin?: number;
  pixelScale?: number;
  fade?: boolean;
  duration?: number;
  pixelDuration?: number;
  pattern?: Pattern;
  randomness?: number;
  easing?: string;
  trigger?: Trigger;
  initialActive?: boolean;
  active?: boolean;
  onActiveChange?: (active: boolean) => void;
  onComplete?: (active: boolean) => void;
  aspectRatio?: string;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  reveal?: boolean;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const noise = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

const patternValue = (pattern: Pattern, x: number, y: number) => {
  switch (pattern) {
    case 'center': return Math.hypot(x - 0.5, y - 0.5) / Math.SQRT1_2;
    case 'edges': return Math.min(x, 1 - x, y, 1 - y) * 2;
    case 'left-to-right': return x;
    case 'right-to-left': return 1 - x;
    case 'top-to-bottom': return y;
    case 'bottom-to-top': return 1 - y;
    case 'diagonal': return (x + y) / 2;
    case 'spiral': {
      const angle = (Math.atan2(y - 0.5, x - 0.5) + Math.PI) / (Math.PI * 2);
      const radius = Math.hypot(x - 0.5, y - 0.5) / Math.SQRT1_2;
      return (angle + radius) % 1;
    }
    case 'random':
    default: return null;
  }
};

const buildGrid = ({ width, height, pixelSize, gap, pattern, randomness }: { width: number; height: number; pixelSize: number; gap: number; pattern: Pattern; randomness: number }): Grid => {
  let size = pixelSize;
  let columns = Math.max(1, Math.ceil((width + gap) / (size + gap)));
  let rows = Math.max(1, Math.ceil((height + gap) / (size + gap)));

  if (columns * rows > MAX_PIXELS) {
    size = Math.ceil(size * Math.sqrt((columns * rows) / MAX_PIXELS));
    columns = Math.max(1, Math.ceil((width + gap) / (size + gap)));
    rows = Math.max(1, Math.ceil((height + gap) / (size + gap)));
  }

  const stride = size + gap;
  const originX = (width - (columns * stride - gap)) / 2;
  const originY = (height - (rows * stride - gap)) / 2;
  const mix = clamp(randomness, 0, 1);
  const pixels: Pixel[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const id = row * columns + column;
      const x = columns <= 1 ? 0.5 : column / (columns - 1);
      const y = rows <= 1 ? 0.5 : row / (rows - 1);
      const base = patternValue(pattern, x, y);
      const random = noise(id + 1);
      pixels.push({ id, left: originX + column * stride, top: originY + row * stride, offset: base === null ? random : base * (1 - mix) + random * mix });
    }
  }

  return { pixels, size, gap, width, height };
};

const makeEasing = (value: string) => {
  const match = /cubic-bezier\(([^)]+)\)/.exec(value);
  const points = match ? match[1].split(',').map(Number) : [0.22, 1, 0.36, 1];
  const [x1, y1, x2, y2] = points.length === 4 && points.every(Number.isFinite) ? points : [0, 0, 1, 1];
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  return (progress: number) => {
    let t = progress;
    for (let i = 0; i < 5; i += 1) {
      const slope = (3 * ax * t + 2 * bx) * t + cx;
      if (!slope) break;
      t -= (((ax * t + bx) * t + cx) * t - progress) / slope;
    }
    t = clamp(t, 0, 1);
    return ((ay * t + by) * t + cy) * t;
  };
};

const buildKeyframes = (ease: (progress: number) => number, startScale: number, endScale: number, spin: number, fade: boolean, reverse: boolean) => {
  const windowFrames: Keyframe[] = [];
  const contentFrames: Keyframe[] = [];
  for (let step = 0; step <= KEYFRAME_STEPS; step += 1) {
    const progress = step / KEYFRAME_STEPS;
    const eased = ease(progress);
    const scale = startScale + (endScale - startScale) * eased;
    const angle = spin * (1 - eased);
    windowFrames.push({ offset: progress, opacity: fade ? reverse ? 1 - eased : Math.min(1, eased * 1.6) : 1, transform: `rotate(${angle}deg) scale(${scale})` });
    contentFrames.push({ offset: progress, transform: `scale(${1 / scale}) rotate(${-angle}deg)` });
  }
  return { windowFrames, contentFrames };
};

const coverScale = (size: number, gap: number) => Math.max(1, ((size + gap) / size) * Math.SQRT1_2);

export default function PixelSwap({
  firstContent,
  secondContent,
  pixelSize = 8,
  gap = 1,
  pixelRadius = 20,
  pixelSpin = 0,
  pixelScale = 0.35,
  fade = true,
  duration = 520,
  pixelDuration = 260,
  pattern = 'random',
  randomness = 0,
  easing = 'cubic-bezier(0.22, 1, 0.36, 1)',
  trigger = 'click',
  initialActive = false,
  active,
  onActiveChange,
  onComplete,
  aspectRatio = '1 / 1',
  className = '',
  style,
  ariaLabel,
  reveal = false
}: PixelSwapProps) {
  const [internalActive, setInternalActive] = useState(initialActive);
  const [shownActive, setShownActive] = useState(active ?? initialActive);
  const [transition, setTransition] = useState<Transition | null>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pixelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationsRef = useRef<Animation[]>([]);
  const timerRef = useRef<number | null>(null);
  const desiredActive = active ?? internalActive;
  const incomingIndex = transition?.to ? 1 : 0;

  const grid = useMemo(() => buildGrid({ width: box.width, height: box.height, pixelSize: Math.max(4, Math.round(pixelSize)), gap: Math.max(0, Math.round(gap)), pattern, randomness }), [box, pixelSize, gap, pattern, randomness]);
  const gridRef = useRef(grid);
  gridRef.current = grid;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => setBox({ width: container.clientWidth, height: container.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const stopAnimations = useCallback(() => {
    animationsRef.current.forEach(animation => animation.cancel());
    animationsRef.current = [];
    pixelRefs.current.forEach(pixel => pixel?.replaceChildren());
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => stopAnimations, [stopAnimations]);

  useEffect(() => {
    if (!transition && desiredActive !== shownActive) setTransition({ to: desiredActive, grid: gridRef.current });
  }, [desiredActive, shownActive, transition]);

  useEffect(() => {
    if (!transition) return;
    const { grid: frozenGrid, to } = transition;
    const finish = () => {
      stopAnimations();
      setShownActive(to);
      setTransition(null);
      onComplete?.(to);
    };
    const source = layerRefs.current[reveal ? (to ? 0 : 1) : (to ? 1 : 0)];
    if (!source || !frozenGrid.pixels.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }

    const total = Math.max(200, duration);
    const pixelMs = Math.min(Math.max(60, pixelDuration), total);
    const spread = Math.max(0, total - pixelMs);
    const endScale = coverScale(frozenGrid.size, frozenGrid.gap);
    const smallScale = clamp(pixelScale, 0.05, 1) * endScale;
    const { windowFrames, contentFrames } = buildKeyframes(makeEasing(easing), reveal ? endScale : smallScale, reveal ? smallScale : endScale, pixelSpin, fade, reveal);

    frozenGrid.pixels.forEach((pixel, index) => {
      const pixelElement = pixelRefs.current[index];
      if (!pixelElement) return;
      const content = document.createElement('div');
      content.className = 'pixel-swap__pixel-content';
      content.style.left = `${-pixel.left}px`;
      content.style.top = `${-pixel.top}px`;
      content.style.width = `${frozenGrid.width}px`;
      content.style.height = `${frozenGrid.height}px`;
      const clone = source.cloneNode(true) as HTMLElement;
      clone.dataset.visible = 'true';
      clone.removeAttribute('aria-hidden');
      content.appendChild(clone);
      pixelElement.replaceChildren(content);
      const timing: KeyframeAnimationOptions = { duration: pixelMs, delay: pixel.offset * spread, easing: 'linear', fill: 'both' };
      animationsRef.current.push(pixelElement.animate(windowFrames, timing), content.animate(contentFrames, timing));
    });
    timerRef.current = window.setTimeout(finish, total);
    return stopAnimations;
  }, [duration, easing, fade, onComplete, pixelDuration, pixelScale, pixelSpin, reveal, stopAnimations, transition]);

  const requestActive = useCallback((next: boolean) => {
    if (active === undefined) setInternalActive(next);
    onActiveChange?.(next);
  }, [active, onActiveChange]);

  const interactionProps = useMemo(() => {
    if (trigger === 'hover') return { onMouseEnter: () => requestActive(true), onMouseLeave: () => requestActive(false), onFocus: () => requestActive(true), onBlur: () => requestActive(false), tabIndex: 0 };
    if (trigger === 'click') return {
      onClick: () => requestActive(!desiredActive),
      onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); requestActive(!desiredActive); }
      },
      role: 'button' as const,
      tabIndex: 0
    };
    return {};
  }, [desiredActive, requestActive, trigger]);

  const renderLayer = (content: ReactNode, index: number) => {
    const isShown = index === (shownActive ? 1 : 0);
    return <div key={index} ref={element => { layerRefs.current[index] = element; }} className="pixel-swap__layer" data-visible={isShown && !(transition && index === incomingIndex)} style={{ zIndex: isShown ? 2 : 1 }} aria-hidden={!isShown}>{content}</div>;
  };

  return <div ref={containerRef} className={`pixel-swap ${className}`.trim()} style={{ aspectRatio, ...style }} data-active={shownActive} data-transitioning={!!transition} aria-label={ariaLabel} {...interactionProps}>
    {renderLayer(firstContent, 0)}
    {renderLayer(secondContent, 1)}
    {transition && <div className="pixel-swap__grid" aria-hidden="true">{transition.grid.pixels.map((pixel, index) => <div key={pixel.id} ref={element => { pixelRefs.current[index] = element; }} className="pixel-swap__pixel" style={{ left: pixel.left, top: pixel.top, width: transition.grid.size, height: transition.grid.size, borderRadius: `${clamp(pixelRadius, 0, 50)}%` }} />)}</div>}
  </div>;
}
