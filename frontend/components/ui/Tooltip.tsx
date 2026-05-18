'use client';
import { useState } from 'react';

interface Props { content: string; children: React.ReactNode; }

export function Tooltip({ content, children }: Props) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%',
          transform: 'translateX(-50%)', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 6,
          padding: '.375rem .625rem', whiteSpace: 'nowrap',
          fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem',
          color: 'var(--text)', pointerEvents: 'none', zIndex: 50,
        }}>{content}</span>
      )}
    </span>
  );
}
