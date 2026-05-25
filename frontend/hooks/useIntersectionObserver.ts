'use client';
import { useEffect, useRef, useState } from 'react';

interface Options { threshold?: number; rootMargin?: string; }

export function useIntersectionObserver<T extends HTMLElement>(options: Options = {}) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: options.threshold ?? 0, rootMargin: options.rootMargin ?? '0px' }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return { ref, visible };
}
