'use client';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useKeyPress } from '@/hooks/useKeyPress';
import { ariaLabel } from '@/lib/accessibility';

interface Props { open: boolean; title: string; onClose: () => void; children: React.ReactNode; width?: number; }

export function AccessibleModal({ open, title, onClose, children, width = 480 }: Props) {
  const trapRef = useFocusTrap<HTMLDivElement>(open);
  useKeyPress('Escape', onClose);
  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" {...ariaLabel(title)} style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.7)' }} onClick={onClose} />
      <div ref={trapRef} style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', width: '90%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontSize: '1.25rem' }}>{title}</h2>
          <button onClick={onClose} {...ariaLabel('Close')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '1.25rem', lineHeight: 1 }}>x</button>
        </div>
        {children}
      </div>
    </div>
  );
}
