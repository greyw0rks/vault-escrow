'use client';
import { useState, useRef, useCallback } from 'react';

export function useHover<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [hovered, setHovered] = useState(false);
  const onMouseEnter = useCallback(() => setHovered(true), []);
  const onMouseLeave = useCallback(() => setHovered(false), []);
  return { ref, hovered, onMouseEnter, onMouseLeave };
}
