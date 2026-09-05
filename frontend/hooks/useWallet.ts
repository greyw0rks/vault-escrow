'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  connectWallet, currentAddress, disconnectWallet, isUserCancel, isWalletConnected,
} from '../lib/wallet';

/**
 * The app's only wallet hook. `ready` distinguishes "not connected" from
 * "haven't checked yet", which is what the old hardcoded `isSignedIn = false`
 * on the landing page was standing in for.
 */
export function useWallet() {
  const [address, setAddress] = useState('');
  const [connected, setConnected] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      const already = await isWalletConnected();
      const addr = already ? await currentAddress() : '';
      if (!live) return;
      setConnected(already);
      setAddress(addr);
      setReady(true);
    })();
    return () => { live = false; };
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    try {
      const addr = await connectWallet();
      setAddress(addr);
      setConnected(true);
    } catch (e) {
      if (!isUserCancel(e)) setError((e as Error).message || 'Wallet connection failed');
    }
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectWallet();
    setAddress('');
    setConnected(false);
  }, []);

  return { address, connected, ready, error, connect, disconnect };
}
