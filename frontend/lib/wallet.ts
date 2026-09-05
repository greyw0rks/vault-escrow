'use client';

import { CONTRACT_ID, NETWORK_NAME, type ContractCall } from './contract';

/**
 * @stacks/connect reads window and localStorage on import, so it is loaded
 * lazily — a static import pulls it into the server bundle and breaks the
 * prerender pass with "module factory is not available".
 */
const wallet = () => import('@stacks/connect');

const API_BASE = NETWORK_NAME === 'mainnet' ? 'https://api.hiro.so' : 'https://api.testnet.hiro.so';

export async function isWalletConnected(): Promise<boolean> {
  const { isConnected } = await wallet();
  return isConnected();
}

/** The STX address the wallet handed us — no guessing at mainnet vs testnet. */
export async function currentAddress(): Promise<string> {
  const { getLocalStorage } = await wallet();
  return getLocalStorage()?.addresses?.stx?.[0]?.address ?? '';
}

export async function connectWallet(): Promise<string> {
  const { connect } = await wallet();
  await connect();
  return currentAddress();
}

export async function disconnectWallet(): Promise<void> {
  const { disconnect } = await wallet();
  disconnect();
}

export function isUserCancel(err: unknown): boolean {
  return /cancel|reject|closed|denied/i.test((err as Error)?.message ?? '');
}

/** Hand a contract call to the wallet. Returns the txid, or null if cancelled. */
export async function callContract(call: ContractCall): Promise<string | null> {
  const { request } = await wallet();
  const res = await request('stx_callContract', {
    contract: CONTRACT_ID as `${string}.${string}`,
    functionName: call.functionName,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    functionArgs: call.functionArgs as any,
    network: NETWORK_NAME as 'mainnet' | 'testnet',
  });
  return res?.txid ?? null;
}

export type TxOutcome = {
  status: 'success' | 'abort_by_response' | 'abort_by_post_condition' | 'pending' | 'unknown';
  /** Clarity repr of the return value, e.g. "(ok u1845)". */
  repr: string | null;
};

/**
 * Poll Hiro until the transaction leaves the mempool. Stacks blocks land about
 * every 10 minutes, so the ceiling is generous and callers show progress.
 */
export async function waitForTx(
  txid: string,
  { timeoutMs = 20 * 60_000, intervalMs = 8_000 }: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<TxOutcome> {
  const id = txid.replace(/^0x/, '');
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${API_BASE}/extended/v1/tx/0x${id}`);
      if (res.ok) {
        const tx = await res.json();
        if (tx.tx_status && tx.tx_status !== 'pending') {
          return { status: tx.tx_status, repr: tx.tx_result?.repr ?? null };
        }
      }
    } catch { /* transient — keep polling */ }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return { status: 'pending', repr: null };
}

/** Pull the uint out of a Clarity `(ok uN)` response. */
export function parseOkUint(repr: string | null): number | null {
  const m = repr?.match(/^\(ok\s+u(\d+)\)$/);
  return m ? Number(m[1]) : null;
}
