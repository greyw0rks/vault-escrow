import { CopyButton } from './CopyButton';
import { truncatePrincipal } from '@/lib/contract';

interface Props { address: string; chars?: number; label?: string; }

export function AddressDisplay({ address, chars = 6, label }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
      {label && <span style={{ fontSize: '.75rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>{label}</span>}
      <code style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.8125rem' }}>{truncatePrincipal(address, chars)}</code>
      <CopyButton text={address} />
    </div>
  );
}
