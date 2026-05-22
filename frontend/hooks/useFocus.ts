'use client';
import { useState, useCallback, useRef } from 'react';

export function useFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [focused, setFocused] = useState(false);

  const onFocus = useCallback(() => setFocused(true), []);
  const onBlur  = useCallback(() => setFocused(false), []);
  const focus   = useCallback(() => ref.current?.focus(), []);

  return { ref, focused, onFocus, onBlur, focus };
}
