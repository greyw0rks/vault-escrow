'use client';
import type { Notification } from '@/hooks/useNotifications';

const BG: Record<Notification['type'], string> = {
  success: '#1D9E75', error: '#A32D2D', info: '#7C6AF7',
};

interface Props { notifications: Notification[]; onRemove: (id: string) => void; }

export function NotificationStack({ notifications, onRemove }: Props) {
  if (notifications.length === 0) return null;
  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.5rem', zIndex: 1000 }}>
      {notifications.map(n => (
        <div key={n.id} style={{
          background: 'var(--surface)', border: '1px solid ' + BG[n.type] + '44',
          borderLeft: '3px solid ' + BG[n.type],
          borderRadius: 'var(--radius)', padding: '.75rem 1rem',
          display: 'flex', alignItems: 'center', gap: '.75rem',
          fontFamily: "'DM Sans',sans-serif", fontSize: '.875rem',
          boxShadow: '0 4px 16px rgba(0,0,0,.3)', minWidth: 280,
        }}>
          <span style={{ flex: 1, color: 'var(--text)' }}>{n.message}</span>
          <button onClick={() => onRemove(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '1rem' }}>×</button>
        </div>
      ))}
    </div>
  );
}
