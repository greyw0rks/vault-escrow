'use client';
import type { TimelineEvent } from '@/hooks/useEscrowTimeline';

export function AuditLog({ events }: { events: TimelineEvent[] }) {
  return (
    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem' }}>
      <div style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.75rem' }}>Audit Log</div>
      {events.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No events recorded.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
          {events.map((ev, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '.5rem .75rem', background: 'var(--raised)', borderRadius: 4 }}>
              <span style={{ color: 'var(--text)' }}>{ev.label}</span>
              <span style={{ color: 'var(--muted)' }}>#{ev.block.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
