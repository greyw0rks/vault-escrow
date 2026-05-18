'use client';
import { useWallet } from '@/hooks/useWallet';

export function ConnectPrompt({ message = 'Connect your wallet to continue.' }: { message?: string }) {
  const { connect } = useWallet();
  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '4rem 1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', opacity: .4 }}>⬡</div>
      <p style={{ color: 'var(--muted)', fontFamily: "'DM Sans',sans-serif", maxWidth: 360 }}>{message}</p>
      <button className="btn-primary btn-lg" onClick={connect}>Connect Wallet</button>
    </main>
  );
}
