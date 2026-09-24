'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import {
  NETWORK_NAME,
  explorerTx,
  waitForTx,
  parseOkUint,
  decodeError,
  type ContractCall,
} from './contract';

// Lazy import keeps @stacks/connect (which touches window/localStorage) out of
// the SSR bundle — it's only ever pulled in inside a browser event handler.
const wallet = () => import('@stacks/connect');

interface SubmitResult {
  txid: string;
  status: string;
  repr: string;
  okId: number | null;
}

interface AppContextValue {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  submit: (call: ContractCall, label: string) => Promise<SubmitResult | null>;
  /** Bumps whenever a tx confirms — pages watch it to re-read chain state. */
  refreshKey: number;
  refresh: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Restore an existing wallet session on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const w = await wallet();
      if (!w.isConnected()) return;
      const stx = w.getLocalStorage()?.addresses?.stx?.[0]?.address ?? null;
      if (!cancelled) setAddress(stx);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const w = await wallet();
      await w.connect();
      const stx = w.getLocalStorage()?.addresses?.stx?.[0]?.address ?? null;
      setAddress(stx);
      if (stx) toast.success('Wallet linked', { description: stx });
    } catch (e) {
      const message = (e as Error)?.message ?? '';
      if (/cancel|reject|closed/i.test(message)) {
        toast.error('Wallet connection cancelled');
      } else if (/configured|onboard/i.test(message)) {
        // A wallet extension (e.g. Talisman) is installed but not set up, so it
        // rejects the request. Report the real cause instead of "cancelled".
        toast.error('Wallet not set up', {
          description: 'A wallet extension is installed but not set up. Finish its onboarding, disable it, or use Leather / Xverse.',
        });
      } else {
        toast.error('Wallet connection failed', { description: message || 'Could not open a wallet.' });
      }
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const w = await wallet();
    w.disconnect();
    setAddress(null);
    toast('Wallet unlinked');
  }, []);

  const submit = useCallback(
    async (call: ContractCall, label: string): Promise<SubmitResult | null> => {
      const w = await wallet();
      if (!w.isConnected()) {
        toast.error('Connect a wallet first');
        return null;
      }
      let txid: string;
      try {
        const res = await w.request('stx_callContract', {
          contract: call.contractId as `${string}.${string}`,
          functionName: call.functionName,
          functionArgs: call.functionArgs,
          network: NETWORK_NAME,
        });
        if (!res.txid) {
          toast.error(`${label} rejected`, { description: 'No transaction id returned.' });
          return null;
        }
        txid = res.txid;
      } catch (e) {
        toast.error(`${label} rejected`, { description: decodeError(String(e)) });
        return null;
      }

      const tid = toast.loading(`${label} — broadcasting`, {
        description: 'Waiting for confirmation…',
      });
      const { status, repr } = await waitForTx(txid);
      const okId = parseOkUint(repr);

      if (status === 'success') {
        toast.success(`${label} confirmed`, {
          id: tid,
          description: 'View on explorer',
          action: { label: 'EXPLORER', onClick: () => window.open(explorerTx(txid), '_blank') },
        });
        refresh();
      } else if (status === 'pending') {
        toast.warning(`${label} still pending`, {
          id: tid,
          description: 'Taking longer than usual — check the explorer.',
          action: { label: 'EXPLORER', onClick: () => window.open(explorerTx(txid), '_blank') },
        });
      } else {
        toast.error(`${label} failed`, { id: tid, description: decodeError(repr || status) });
      }
      return { txid, status, repr, okId };
    },
    [refresh],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      address,
      connected: address !== null,
      connecting,
      connect,
      disconnect,
      submit,
      refreshKey,
      refresh,
    }),
    [address, connecting, connect, disconnect, submit, refreshKey, refresh],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
