'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import './ShapeWaves.css';

type ShapeWavesProps = {
  color?: string;
  backgroundColor?: string;
  cellSize?: number;
  speed?: number;
  scale?: number;
  fade?: number;
  interactive?: boolean;
  className?: string;
  style?: CSSProperties;
};

type Ripple = { x: number; y: number; strength: number; time: number };

const hash = (x: number, y: number) => {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
};

export default function ShapeWaves({
  color = '#929292',
  backgroundColor = '#090909',
  cellSize = 22,
  speed = 1,
  scale = 1,
  fade = 0.35,
  interactive = true,
  className = '',
  style
}: ShapeWavesProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorRef = useRef(color);
  const backgroundRef = useRef(backgroundColor);
  const ripplesRef = useRef<Ripple[]>([]);

  colorRef.current = color;
  backgroundRef.current = backgroundColor;

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let startedAt = performance.now();

    const resize = () => {
      const bounds = root.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!interactive) return;
      const bounds = root.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      if (x < 0 || y < 0 || x > bounds.width || y > bounds.height) return;
      const previous = ripplesRef.current[0];
      if (!previous || Math.hypot(previous.x - x, previous.y - y) > 18) {
        ripplesRef.current.unshift({ x, y, strength: 1, time: performance.now() });
        ripplesRef.current = ripplesRef.current.slice(0, 8);
      }
    };

    const drawShape = (x: number, y: number, size: number, shape: number) => {
      const half = size / 2;
      context.beginPath();
      if (shape === 0) {
        context.rect(x - half, y - half, size, size);
      } else if (shape === 1) {
        context.arc(x, y, half, 0, Math.PI * 2);
      } else {
        context.moveTo(x, y - half);
        context.lineTo(x + half, y + half);
        context.lineTo(x - half, y + half);
        context.closePath();
      }
      context.fill();
    };

    const render = (now: number) => {
      const elapsed = (now - startedAt) / 1000;
      context.clearRect(0, 0, width, height);
      context.fillStyle = backgroundRef.current;
      context.fillRect(0, 0, width, height);

      const size = Math.max(10, cellSize);
      const columns = Math.ceil(width / size) + 1;
      const rows = Math.ceil(height / size) + 1;
      const centerX = width / 2;
      const centerY = height / 2;
      const colorValue = colorRef.current;
      context.fillStyle = colorValue;

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const x = column * size;
          const y = row * size;
          const distance = Math.hypot(x - centerX, y - centerY) / Math.hypot(centerX, centerY);
          const wave = Math.sin(column * 0.42 + row * 0.27 + elapsed * 1.25 * speed + Math.sin(elapsed * 0.7) * 1.8) * 0.5 + 0.5;
          const swell = Math.sin(distance * 8 / Math.max(0.2, scale) - elapsed * 0.8 * speed) * 0.5 + 0.5;
          let brightness = 0.16 + wave * 0.22 + swell * 0.18;

          for (const ripple of ripplesRef.current) {
            const age = (now - ripple.time) / 1000;
            const radius = age * 220;
            const delta = Math.abs(Math.hypot(x - ripple.x, y - ripple.y) - radius);
            brightness += Math.max(0, 1 - delta / 70) * Math.max(0, 1 - age / 1.8) * 0.42;
          }

          const edgeFade = fade ? Math.max(0.18, 1 - distance * fade) : 1;
          const alpha = Math.min(0.7, brightness * edgeFade);
          if (alpha < 0.05) continue;
          context.globalAlpha = alpha;
          const shape = Math.floor(hash(column, row) * 3);
          const dot = size * (0.18 + brightness * 0.35);
          drawShape(x, y, dot, shape);
        }
      }

      context.globalAlpha = 1;
      ripplesRef.current = ripplesRef.current.filter(ripple => now - ripple.time < 2400);
      frame = requestAnimationFrame(render);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [cellSize, fade, interactive, scale, speed]);

  return <div ref={rootRef} className={`shape-waves ${className}`.trim()} style={{ backgroundColor, ...style }} aria-hidden="true">
    <canvas ref={canvasRef} className="shape-waves__canvas" />
  </div>;
}
