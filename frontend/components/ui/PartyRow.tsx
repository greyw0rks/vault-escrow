import { AddressDisplay } from './AddressDisplay';
import { RoleBadge } from './RoleBadge';
import type { Escrow } from '@/lib/contract';
import type { Role } from '@/lib/types';

interface Party { label: string; address: string; role: Role; }

export function PartyRow({ escrow, myAddress }: { escrow: Escrow; myAddress: string | null }) {
  const parties: Party[] = [
    { label: 'Client',   address: escrow.client,   role: 'client' },
    { label: 'Worker',   address: escrow.worker,   role: 'worker' },
    { label: 'Resolver', address: escrow.resolver, role: 'resolver' },
  ];
  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
      {parties.map(({ label, address, role }) => (
        <div key={role} style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
          <span style={{ fontSize: '.75rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>{label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <AddressDisplay address={address} />
            {myAddress === address && <RoleBadge role={role} />}
          </div>
        </div>
      ))}
    </div>
  );
}
