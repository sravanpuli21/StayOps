'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CarouselSlide {
  id: string;
  content: React.ReactNode;
}

interface FeatureCarouselProps {
  slides: CarouselSlide[];
  autoAdvanceMs?: number;
}

export function FeatureCarousel({ slides, autoAdvanceMs = 6000 }: FeatureCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  const goTo = (i: number) => {
    const clamped = ((i % slides.length) + slides.length) % slides.length;
    setIndex(clamped);
  };
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, autoAdvanceMs);
    return () => clearInterval(t);
  }, [paused, slides.length, autoAdvanceMs]);

  // keyboard arrows
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) next(); else prev();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        tabIndex={0}
        className="overflow-hidden rounded-3xl focus:outline-none focus:ring-2"
        style={{ outlineColor: '#ff385c' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="region"
        aria-roledescription="carousel"
        aria-label="Product pillars"
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className="w-full flex-shrink-0"
              aria-hidden={i !== index}
            >
              {slide.content}
            </div>
          ))}
        </div>
      </div>

      {/* Arrows — hidden on very small screens since swipe works */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous product"
        className="hidden sm:inline-flex absolute left-2 sm:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full shadow-md transition-transform hover:scale-105"
        style={{ background: '#fff', color: '#222', border: '1px solid #eee' }}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next product"
        className="hidden sm:inline-flex absolute right-2 sm:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full shadow-md transition-transform hover:scale-105"
        style={{ background: '#fff', color: '#222', border: '1px solid #eee' }}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className="rounded-full transition-all"
            style={{
              width: i === index ? 22 : 8,
              height: 8,
              background: i === index ? '#ff385c' : '#dddddd',
            }}
          />
        ))}
      </div>
    </div>
  );
}
