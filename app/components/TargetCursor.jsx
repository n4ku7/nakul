'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import './TargetCursor.css';

const TargetCursor = ({
  targetSelector = '.cursor-target',
  spinDuration = 2,
  hideDefaultCursor = true,
  hoverDuration = 0.2,
  parallaxOn = true,
  cursorColor = '#ffffff',
  cursorColorOnTarget
}) => {
  const wrapperRef = useRef(null);
  const dotRef = useRef(null);
  const cornersRef = useRef([]);
  const spinRef = useRef(null);
  const activeTargetRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isMobile || !wrapperRef.current) return undefined;

    const wrapper = wrapperRef.current;
    const corners = cornersRef.current;
    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) document.body.style.cursor = 'none';

    const setPosition = (x, y) => gsap.to(wrapper, { x, y, duration: 0.1, ease: 'power3.out' });
    const setCorners = (target, duration = hoverDuration) => {
      const rect = target.getBoundingClientRect();
      const cursorX = gsap.getProperty(wrapper, 'x');
      const cursorY = gsap.getProperty(wrapper, 'y');
      const positions = [
        { x: rect.left - cursorX - 3, y: rect.top - cursorY - 3 },
        { x: rect.right - cursorX - 9, y: rect.top - cursorY - 3 },
        { x: rect.right - cursorX - 9, y: rect.bottom - cursorY - 9 },
        { x: rect.left - cursorX - 3, y: rect.bottom - cursorY - 9 }
      ];
      corners.forEach((corner, index) => gsap.to(corner, {
        x: positions[index].x,
        y: positions[index].y,
        duration,
        ease: 'power2.out',
        overwrite: true
      }));
    };
    const resetCorners = () => {
      const size = 12;
      const positions = [
        { x: -size * 1.5, y: -size * 1.5 },
        { x: size * 0.5, y: -size * 1.5 },
        { x: size * 0.5, y: size * 0.5 },
        { x: -size * 1.5, y: size * 0.5 }
      ];
      corners.forEach((corner, index) => gsap.to(corner, { ...positions[index], duration: 0.3, ease: 'power3.out', overwrite: true }));
    };
    const setColor = color => {
      if (!color) return;
      gsap.to([...corners, dotRef.current], { borderColor: color, backgroundColor: color, duration: 0.15, overwrite: true });
    };
    const restoreColor = () => {
      gsap.to(corners, { borderColor: cursorColor, duration: 0.15, overwrite: true });
      gsap.to(dotRef.current, { backgroundColor: cursorColor, duration: 0.15, overwrite: true });
    };
    const releaseTarget = () => {
      if (!activeTargetRef.current) return;
      activeTargetRef.current = null;
      gsap.killTweensOf(corners, 'x,y');
      gsap.killTweensOf(wrapper, 'scale');
      gsap.set(wrapper, { rotation: 0, scale: 1 });
      gsap.set(corners, { clearProps: 'x,y' });
      restoreColor();
      spinRef.current?.restart(true);
    };
    const moveHandler = event => {
      setPosition(event.clientX, event.clientY);
      const elementUnderCursor = document.elementFromPoint(event.clientX, event.clientY);
      const targetUnderCursor = elementUnderCursor?.closest?.(targetSelector);
      if (!targetUnderCursor) {
        releaseTarget();
      } else if (activeTargetRef.current !== targetUnderCursor) {
        overHandler({ target: targetUnderCursor });
      } else {
        setCorners(activeTargetRef.current, parallaxOn ? 0.2 : 0);
      }
    };
    const overHandler = event => {
      const target = event.target.closest?.(targetSelector);
      if (!target || activeTargetRef.current === target) return;
      if (activeTargetRef.current) releaseTarget();
      activeTargetRef.current = target;
      spinRef.current?.pause();
      gsap.set(wrapper, { rotation: 0 });
      setCorners(target);
      setColor(cursorColorOnTarget || cursorColor);
    };
    const outHandler = event => {
      const target = activeTargetRef.current;
      if (!target || target.contains(event.relatedTarget)) return;
      releaseTarget();
    };
    const downHandler = () => {
      gsap.to(dotRef.current, { scale: 0.7, duration: 0.2 });
      gsap.to(wrapper, { scale: 0.9, duration: 0.2 });
    };
    const upHandler = () => {
      gsap.to(dotRef.current, { scale: 1, duration: 0.25 });
      gsap.to(wrapper, { scale: 1, duration: 0.2 });
    };
    const directTargets = Array.from(document.querySelectorAll(targetSelector));
    const directEnterHandlers = directTargets.map(target => {
      const handler = () => overHandler({ target });
      target.addEventListener('mouseenter', handler);
      return { target, handler };
    });
    const directLeaveHandlers = directTargets.map(target => {
      const handler = () => {
        if (activeTargetRef.current === target) releaseTarget();
      };
      target.addEventListener('mouseleave', handler);
      return { target, handler };
    });

    gsap.set(wrapper, { x: window.innerWidth / 2, y: window.innerHeight / 2, xPercent: -50, yPercent: -50 });
    resetCorners();
    spinRef.current = gsap.timeline({ repeat: -1 }).to(wrapper, { rotation: '+=360', duration: spinDuration, ease: 'none' });
    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseover', overHandler);
    window.addEventListener('mouseout', outHandler);
    window.addEventListener('mousedown', downHandler);
    window.addEventListener('mouseup', upHandler);

    return () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseover', overHandler);
      window.removeEventListener('mouseout', outHandler);
      window.removeEventListener('mousedown', downHandler);
      window.removeEventListener('mouseup', upHandler);
      directEnterHandlers.forEach(({ target, handler }) => target.removeEventListener('mouseenter', handler));
      directLeaveHandlers.forEach(({ target, handler }) => target.removeEventListener('mouseleave', handler));
      spinRef.current?.kill();
      document.body.style.cursor = originalCursor;
    };
  }, [cursorColor, cursorColorOnTarget, hideDefaultCursor, hoverDuration, isMobile, mounted, parallaxOn, spinDuration, targetSelector]);

  if (!mounted || isMobile || typeof document === 'undefined') return null;

  return createPortal(
    <div ref={wrapperRef} className="target-cursor-wrapper" aria-hidden="true">
      <div ref={dotRef} className="target-cursor-dot" style={{ backgroundColor: cursorColor }} />
      {['corner-tl', 'corner-tr', 'corner-br', 'corner-bl'].map((position, index) => (
        <div key={position} ref={element => { cornersRef.current[index] = element; }} className={`target-cursor-corner ${position}`} style={{ borderColor: cursorColor }} />
      ))}
    </div>,
    document.body
  );
};

export default TargetCursor;
