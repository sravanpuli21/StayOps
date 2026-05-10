'use client';

import { useEffect, useRef, useState } from 'react';

interface RotatingWordProps {
  words: string[];
  intervalMs?: number;
  color?: string;
}

export function RotatingWord({ words, intervalMs = 2000, color = '#ff385c' }: RotatingWordProps) {
  const [index, setIndex] = useState(0);
  const [measured, setMeasured] = useState<number | null>(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, words.length]);

  useEffect(() => {
    if (!measureRef.current) return;
    const longest = words.reduce((a, b) => (a.length >= b.length ? a : b), '');
    const el = measureRef.current;
    el.textContent = longest;
    const w = el.getBoundingClientRect().width;
    setMeasured(Math.ceil(w));
  }, [words]);

  return (
    <span
      aria-live="polite"
      className="relative inline-block align-baseline overflow-hidden whitespace-nowrap"
      style={{
        color,
        width: measured ? `${measured}px` : undefined,
        minHeight: '1em',
        verticalAlign: 'baseline',
      }}
    >
      <span
        ref={measureRef}
        aria-hidden
        className="absolute opacity-0 pointer-events-none"
        style={{ visibility: 'hidden' }}
      />
      {words.map((w, i) => (
        <span
          key={w}
          className="absolute left-0 top-0 transition-all duration-500"
          style={{
            opacity: i === index ? 1 : 0,
            transform: i === index ? 'translateY(0)' : 'translateY(-100%)',
          }}
        >
          {w}
        </span>
      ))}
      {/* invisible spacer to reserve height */}
      <span className="invisible">{words[index]}</span>
    </span>
  );
}
