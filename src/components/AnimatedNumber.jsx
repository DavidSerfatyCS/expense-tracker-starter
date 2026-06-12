import { useState, useEffect, useRef } from 'react';

// Counts from the previous value to the new one with an ease-out curve.
// Respects prefers-reduced-motion. `format` receives the in-flight number.
function AnimatedNumber({ value, format = (v) => v, duration = 650 }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = to;
    if (from === to) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(to);
      return;
    }

    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className="num">{format(display)}</span>;
}

export default AnimatedNumber;
