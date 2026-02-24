import { useState, useEffect, useRef } from 'react';

export function useAnimatedCounter(target: number | string, duration = 800) {
  const numTarget = typeof target === 'string' ? parseInt(target) || 0 : target;
  const isPercentage = typeof target === 'string' && target.includes('%');
  const [current, setCurrent] = useState(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    const startTime = performance.now();
    const startVal = 0;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(startVal + (numTarget - startVal) * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [numTarget, duration]);

  return isPercentage ? `${current}%` : current;
}
