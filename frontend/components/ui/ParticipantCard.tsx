import { AddressAvatar } from './AddressAvatar';
import { RoleBadge } from './RoleBadge';
import { CopyButton } from './CopyButton';
import { formatShort } from '@/lib/format-address';
import type { Role } from '@/lib/types';

interface Props { address: string; role: Role; isYou?: boolean; }

export function ParticipantCard({ address, role, isYou }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '.75rem 1rem' }}>
      <AddressAvatar address={address} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <RoleBadge role={role} />
          {isYou && <span style={{ fontSize: '.6875rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>you</span>}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.8125rem', marginTop: '.25rem', color: 'var(--muted)' }}>
          {formatShort(address)}
        </div>
      </div>
      <CopyButton text={address} />
    </div>
  );
}
