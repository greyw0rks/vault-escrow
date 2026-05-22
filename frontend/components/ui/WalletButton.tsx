'use client';
import { useWallet } from '@/hooks/useWallet';
import { BalanceDisplay } from './BalanceDisplay';

export function WalletButton() {
  const { connected, address, shortAddress, connect, signOut } = useWallet();
  if (!connected) {
    return <button className="btn-primary" onClick={connect}>Connect Wallet</button>;
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
      <BalanceDisplay address={address} />
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.8125rem', color: 'var(--muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '.35rem .75rem' }}>
        {shortAddress}
      </span>
      <button className="btn-ghost" onClick={signOut} style={{ padding: '.35rem .875rem', fontSize: '.8125rem' }}>Disconnect</button>
    </div>
  );
}
