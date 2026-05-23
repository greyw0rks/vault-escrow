import { ParticipantCard } from './ParticipantCard';
import { SectionHeader } from './SectionHeader';
import { useEscrowParticipants } from '@/hooks/useEscrowParticipants';
import type { Escrow } from '@/lib/contract';

interface Props { escrow: Escrow; myAddress: string | null; }

export function ParticipantsSection({ escrow, myAddress }: Props) {
  const participants = useEscrowParticipants(escrow, myAddress);
  return (
    <div>
      <SectionHeader title="Participants" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '.75rem' }}>
        {participants.map(p => (
          <ParticipantCard key={p.role} address={p.address} role={p.role} isYou={p.isYou} />
        ))}
      </div>
    </div>
  );
}
