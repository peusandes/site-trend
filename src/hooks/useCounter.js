import { useState, useEffect, useRef } from 'react';

/**
 * Animated count-up from 0 → target with ease-out cubic.
 * @param {number} target   Final value
 * @param {number} duration Animation duration in ms
 * @param {number} delay    Delay before starting in ms
 */
export function useCounter(target, duration = 1100, delay = 0) {
  const [count, setCount] = useState(0);
  const rafRef   = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    startRef.current = null;
    let timeoutId;

    const run = () => {
      const step = (ts) => {
        if (!startRef.current) startRef.current = ts;
        const elapsed  = ts - startRef.current;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    };

    if (delay > 0) {
      timeoutId = setTimeout(run, delay);
    } else {
      run();
    }

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  return count;
}
