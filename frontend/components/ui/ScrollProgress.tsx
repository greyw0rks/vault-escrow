'use client';
import { useState } from 'react';
import { useThrottledScroll } from '@/hooks/useThrottledScroll';

function getScrollPct(): number {
  const el = document.documentElement;
  return (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
}

export function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useThrottledScroll(() => setPct(getScrollPct()), 50);
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 999, background: 'var(--border)' }}>
      <div style={{ height: '100%', background: 'var(--gold)', width: pct + '%', transition: 'width .1s linear' }} />
    </div>
  );
}
