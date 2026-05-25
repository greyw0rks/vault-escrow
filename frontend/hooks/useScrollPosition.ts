'use client';
import { useState, useEffect } from 'react';

export function useScrollPosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const update = () => setPos({ x: window.scrollX, y: window.scrollY });
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return pos;
}
