'use client';
import { useState, useEffect } from 'react';
import { useConnect, isConnected, getUserData, disconnect } from '@stacks/connect-react';

export function useWallet() {
  const { authenticate } = useConnect();
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const c = isConnected();
    setConnected(c);
    if (c) {
      const data = getUserData() as any;
      setAddress(data?.profile?.stxAddress?.testnet ?? null);
    }
  }, []);

  const connect = () => authenticate({ appDetails: { name: 'VaultSTX', icon: '/logo.svg' } });
  const signOut = () => { disconnect(); setConnected(false); setAddress(null); };
  const shortAddress = address ? address.slice(0, 8) + '\u2026' + address.slice(-4) : null;

  return { connected, address, shortAddress, connect, signOut };
}
