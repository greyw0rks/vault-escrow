'use client';
import { useClipboard } from '@/hooks/useClipboard';

export function CopyButton({ text }: { text: string }) {
  const { copy, copied } = useClipboard();
  return (
    <button onClick={() => copy(text)} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      color: copied ? '#1D9E75' : 'var(--muted)',
      fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem',
      padding: '.2rem .4rem', borderRadius: 4, transition: 'color .15s',
    }}>
      {copied ? '✓ copied' : 'copy'}
    </button>
  );
}
