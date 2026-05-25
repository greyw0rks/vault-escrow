'use client';
import { useClipboard } from '@/hooks/useClipboard';

interface Props { code: string; language?: string; }

export function CodeBlock({ code, language }: Props) {
  const { copy, copied } = useClipboard();
  return (
    <div style={{ position: 'relative', background: 'var(--raised)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      {language && (
        <div style={{ padding: '.375rem .75rem', borderBottom: '1px solid var(--border)', fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          {language}
        </div>
      )}
      <pre style={{ margin: 0, padding: '1rem', overflowX: 'auto', fontFamily: "'JetBrains Mono',monospace", fontSize: '.8125rem', lineHeight: 1.6 }}>
        <code>{code}</code>
      </pre>
      <button
        onClick={() => copy(code)}
        style={{ position: 'absolute', top: language ? '2.5rem' : '.5rem', right: '.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '.25rem .5rem', cursor: 'pointer', color: copied ? '#1D9E75' : 'var(--muted)', fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem' }}>
        {copied ? '✓' : 'copy'}
      </button>
    </div>
  );
}
