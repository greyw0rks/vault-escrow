import type { Role } from '@/lib/types';

const ROLE_COLORS: Record<Role, string> = {
  client:   'var(--gold)',
  worker:   '#1D9E75',
  resolver: '#7C6AF7',
  observer: 'var(--muted)',
};

export function RoleBadge({ role }: { role: Role }) {
  const color = ROLE_COLORS[role];
  return (
    <span style={{ background: color + '18', color, border: '1px solid ' + color + '33', fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem', padding: '.2rem .5rem', borderRadius: '20px' }}>
      {role}
    </span>
  );
}
