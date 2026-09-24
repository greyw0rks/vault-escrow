import {
  uintCV,
  principalCV,
  stringAsciiCV,
  stringUtf8CV,
  boolCV,
  fetchCallReadOnlyFunction,
  type ClarityValue,
} from '@stacks/transactions';
import { STACKS_MAINNET, STACKS_TESTNET, type StacksNetwork } from '@stacks/network';

const IS_MAINNET = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';

export const NETWORK: StacksNetwork = IS_MAINNET ? STACKS_MAINNET : STACKS_TESTNET;
export const NETWORK_NAME = IS_MAINNET ? 'mainnet' : 'testnet';
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '';

/** Contract names are env-overridable so a rename/redeploy never hard-codes. */
export const ESCROW_NAME = process.env.NEXT_PUBLIC_ESCROW_CONTRACT ?? 'vaultstx-escrow';
export const DISPUTE_NAME = process.env.NEXT_PUBLIC_DISPUTE_CONTRACT ?? 'vaultstx-dispute';
export const FACTORY_NAME = process.env.NEXT_PUBLIC_FACTORY_CONTRACT ?? 'vaultstx-factory';

export const CONTRACT_ID = `${CONTRACT_ADDRESS}.${ESCROW_NAME}`;
export const DISPUTE_ID = `${CONTRACT_ADDRESS}.${DISPUTE_NAME}`;
export const FACTORY_ID = `${CONTRACT_ADDRESS}.${FACTORY_NAME}`;

const API_BASE = IS_MAINNET ? 'https://api.hiro.so' : 'https://api.testnet.hiro.so';

// ── Domain types ───────────────────────────────────────────────────────────

export type EscrowState = 'open' | 'active' | 'disputed' | 'complete' | 'cancelled';
export type MilestoneState = 'pending' | 'submitted' | 'approved' | 'disputed';
export type DisputeState = 'open' | 'resolved' | 'withdrawn';

export interface Escrow {
  id: number;
  client: string;
  worker: string;
  resolver: string;
  totalAmount: bigint;
  deposited: bigint;
  released: bigint;
  milestoneCount: number;
  activeMilestone: number;
  state: EscrowState;
  createdAt: number;
}

export interface Milestone {
  index: number;
  description: string;
  amount: bigint;
  state: MilestoneState;
  blockSubmitted: number;
  blockResolved: number;
}

export interface Dispute {
  id: number;
  escrowId: number;
  client: string;
  provider: string;
  opener: string;
  disputedAmount: bigint;
  clientClaim: bigint;
  providerClaim: bigint;
  reason: string;
  state: DisputeState;
  openedAt: number;
  resolvedAt: number;
  clientAward: bigint;
  providerAward: bigint;
  notes: string;
}

export interface FactoryStats {
  totalEscrows: number;
  totalVolume: bigint;
  nextId: number;
}

/** Index order must match the STATE-* / MS-* / DISPUTE-* constants on chain. */
const ESCROW_STATES: EscrowState[] = ['open', 'active', 'disputed', 'complete', 'cancelled'];
const MS_STATES: MilestoneState[] = ['pending', 'submitted', 'approved', 'disputed'];
const DISPUTE_STATES: Record<number, DisputeState> = { 1: 'open', 2: 'resolved', 3: 'withdrawn' };

/** Human messages for the u100+ error codes across escrow & dispute contracts. */
export function decodeError(raw: string): string {
  const m = raw.match(/\bu(\d+)\b/);
  const code = m ? Number(m[1]) : NaN;
  const map: Record<number, string> = {
    100: 'Not authorized / not a participant.',
    101: 'Not found on chain.',
    102: 'Invalid state (or already disputed).',
    103: 'Zero amount / wrong state.',
    104: 'Cannot escrow with yourself / not a participant.',
    105: 'Cap exceeded / invalid split.',
    106: 'Not the arbitrator.',
    107: 'Already resolved.',
    108: 'Invalid amount.',
    109: 'No arbitrator set.',
  };
  return Number.isNaN(code) ? raw : (map[code] ?? `Contract error u${code}.`);
}

// ── Clarity value decoding ────────────────────────────────────────────────────
// Raw ClarityValues rather than cvToValue(): get-escrow returns
// (optional (tuple ...)) and cvToValue only unwraps the optional. Booleans are
// subtle — they encode in the type ('true' / 'false') and carry no value.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawCV = any;

const unwrapOptional = (cv: RawCV): RawCV | null =>
  cv?.type === 'some' ? cv.value : cv?.type === 'none' ? null : cv;

const fields = (cv: RawCV): Record<string, RawCV> => cv?.value ?? {};
const asBigInt = (cv: RawCV): bigint => BigInt(cv?.value ?? 0);
const asNumber = (cv: RawCV): number => Number(cv?.value ?? 0);
const asString = (cv: RawCV): string => String(cv?.value ?? '');

async function ro(contractName: string, fn: string, args: ClarityValue[]) {
  if (!CONTRACT_ADDRESS)
    throw new Error('NEXT_PUBLIC_CONTRACT_ADDRESS is not set — copy .env.example to .env.local');
  return fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName,
    functionName: fn,
    functionArgs: args,
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS,
  });
}

export const PAGE_SIZE = 24;

// ── Block height ─────────────────────────────────────────────────────────────

export async function fetchBlockHeight(): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/v2/info`, { cache: 'no-store' });
    const json = await res.json();
    return Number(json?.stacks_tip_height ?? 0);
  } catch {
    return 0;
  }
}

// ── Escrow (core) reads ──────────────────────────────────────────────────────

const decodeEscrow = (id: number, f: Record<string, RawCV>): Escrow => ({
  id,
  client: asString(f['client']),
  worker: asString(f['worker']),
  resolver: asString(f['resolver']),
  totalAmount: asBigInt(f['total-amount']),
  deposited: asBigInt(f['deposited']),
  released: asBigInt(f['released']),
  milestoneCount: asNumber(f['milestone-count']),
  activeMilestone: asNumber(f['active-milestone']),
  state: ESCROW_STATES[asNumber(f['state'])] ?? 'open',
  createdAt: asNumber(f['created-at']),
});

/** next-id counts up from 1; live escrow count is next-id − 1. */
export async function fetchNextId(): Promise<number> {
  const cv = await ro(ESCROW_NAME, 'get-next-id', []);
  return asNumber(cv);
}

export async function fetchEscrowCount(): Promise<number> {
  return Math.max(0, (await fetchNextId()) - 1);
}

export async function fetchEscrow(id: number): Promise<Escrow | null> {
  const cv = unwrapOptional(await ro(ESCROW_NAME, 'get-escrow', [uintCV(id)]));
  return cv ? decodeEscrow(id, fields(cv)) : null;
}

export async function fetchMilestone(id: number, index: number): Promise<Milestone | null> {
  const cv = unwrapOptional(await ro(ESCROW_NAME, 'get-milestone', [uintCV(id), uintCV(index)]));
  if (!cv) return null;
  const f = fields(cv);
  return {
    index,
    description: asString(f['description']),
    amount: asBigInt(f['amount']),
    state: MS_STATES[asNumber(f['state'])] ?? 'pending',
    blockSubmitted: asNumber(f['block-submitted']),
    blockResolved: asNumber(f['block-resolved']),
  };
}

export async function fetchMilestones(escrow: Escrow): Promise<Milestone[]> {
  const idxs = Array.from({ length: escrow.milestoneCount }, (_, i) => i);
  const out = await Promise.all(idxs.map((i) => fetchMilestone(escrow.id, i)));
  return out.filter((m): m is Milestone => m !== null);
}

export async function fetchRemaining(id: number): Promise<bigint> {
  const cv = await ro(ESCROW_NAME, 'get-remaining', [uintCV(id)]);
  // (response uint uint): ok carries the value, err falls back to 0.
  return cv?.type === 'ok' ? asBigInt(cv.value) : BigInt(0);
}

/** Newest-first page, counting down from the highest live id. */
export async function fetchEscrowPage(page: number): Promise<Escrow[]> {
  const count = await fetchEscrowCount();
  const top = count - page * PAGE_SIZE;
  if (top < 1) return [];
  const ids: number[] = [];
  for (let id = top; id > top - PAGE_SIZE && id >= 1; id--) ids.push(id);
  const out = await Promise.all(ids.map((id) => fetchEscrow(id)));
  return out.filter((e): e is Escrow => e !== null);
}

/** No on-chain per-address index; scan a window and filter by role. */
export async function fetchEscrowsForAddress(address: string, window = 120): Promise<Escrow[]> {
  const count = await fetchEscrowCount();
  const top = count;
  const ids: number[] = [];
  for (let id = top; id > top - window && id >= 1; id--) ids.push(id);
  const out = await Promise.all(ids.map((id) => fetchEscrow(id)));
  return out.filter(
    (e): e is Escrow =>
      e !== null && [e.client, e.worker, e.resolver].includes(address),
  );
}

// ── Dispute (arbitration) reads ──────────────────────────────────────────────

const decodeDispute = (id: number, f: Record<string, RawCV>): Dispute => ({
  id,
  escrowId: asNumber(f['escrow-id']),
  client: asString(f['client']),
  provider: asString(f['provider']),
  opener: asString(f['opener']),
  disputedAmount: asBigInt(f['disputed-amount']),
  clientClaim: asBigInt(f['client-claim']),
  providerClaim: asBigInt(f['provider-claim']),
  reason: asString(f['reason']),
  state: DISPUTE_STATES[asNumber(f['state'])] ?? 'open',
  openedAt: asNumber(f['opened-at']),
  resolvedAt: asNumber(f['resolved-at']),
  clientAward: asBigInt(f['client-award']),
  providerAward: asBigInt(f['provider-award']),
  notes: asString(f['resolution-notes']),
});

export async function fetchDispute(id: number): Promise<Dispute | null> {
  const cv = unwrapOptional(await ro(DISPUTE_NAME, 'get-dispute', [uintCV(id)]));
  return cv ? decodeDispute(id, fields(cv)) : null;
}

export async function fetchDisputeByEscrow(escrowId: number): Promise<Dispute | null> {
  const cv = unwrapOptional(await ro(DISPUTE_NAME, 'get-dispute-by-escrow', [uintCV(escrowId)]));
  const disputeId = cv ? asNumber(cv) : 0;
  return disputeId ? fetchDispute(disputeId) : null;
}

export async function fetchArbitrator(): Promise<string> {
  return asString(await ro(DISPUTE_NAME, 'get-arbitrator', []));
}

export async function fetchArbitrationFee(): Promise<bigint> {
  return asBigInt(await ro(DISPUTE_NAME, 'get-arbitration-fee', []));
}

export interface DisputeStats {
  total: number;
  resolved: number;
  nextId: number;
  arbitrator: string;
  fee: bigint;
}

export async function fetchDisputeStats(): Promise<DisputeStats> {
  const [total, resolved, nextId, arbitrator, fee] = await Promise.all([
    ro(DISPUTE_NAME, 'get-total-disputes', []).then(asNumber),
    ro(DISPUTE_NAME, 'get-total-resolved', []).then(asNumber),
    ro(DISPUTE_NAME, 'get-next-dispute-id', []).then(asNumber),
    fetchArbitrator(),
    fetchArbitrationFee(),
  ]);
  return { total, resolved, nextId, arbitrator, fee };
}

/** Newest-first dispute page, counting down from the highest live id. */
export async function fetchDisputePage(page: number): Promise<Dispute[]> {
  const nextId = await ro(DISPUTE_NAME, 'get-next-dispute-id', []).then(asNumber);
  const count = Math.max(0, nextId - 1);
  const top = count - page * PAGE_SIZE;
  if (top < 1) return [];
  const ids: number[] = [];
  for (let id = top; id > top - PAGE_SIZE && id >= 1; id--) ids.push(id);
  const out = await Promise.all(ids.map((id) => fetchDispute(id)));
  return out.filter((d): d is Dispute => d !== null);
}

// ── Factory (read-only registry) reads ───────────────────────────────────────

export async function fetchFactoryStats(): Promise<FactoryStats> {
  const [totalEscrows, totalVolume, nextId] = await Promise.all([
    ro(FACTORY_NAME, 'get-total-escrows', []).then(asNumber),
    ro(FACTORY_NAME, 'get-total-volume', []).then(asBigInt),
    ro(FACTORY_NAME, 'get-next-escrow-id', []).then(asNumber),
  ]);
  return { totalEscrows, totalVolume, nextId };
}

export async function fetchClientEscrowCount(address: string): Promise<number> {
  return asNumber(await ro(FACTORY_NAME, 'get-client-escrow-count', [principalCV(address)]));
}

export async function fetchProviderEscrowCount(address: string): Promise<number> {
  return asNumber(await ro(FACTORY_NAME, 'get-provider-escrow-count', [principalCV(address)]));
}

// ── Write builders ───────────────────────────────────────────────────────────
// contractId routes each call to the right contract; the store's submit()
// splits it into the { contract, functionName, functionArgs } request payload.

export interface ContractCall {
  contractId: string;
  functionName: string;
  functionArgs: ClarityValue[];
}

// Escrow (core)
export const buildCreateEscrow = (worker: string, resolver: string, deposit: bigint): ContractCall => ({
  contractId: CONTRACT_ID,
  functionName: 'create-escrow',
  functionArgs: [principalCV(worker), principalCV(resolver), uintCV(deposit)],
});

export const buildAddMilestone = (id: number, description: string, amount: bigint): ContractCall => ({
  contractId: CONTRACT_ID,
  functionName: 'add-milestone',
  functionArgs: [uintCV(id), stringAsciiCV(description), uintCV(amount)],
});

export const buildActivateEscrow = (id: number): ContractCall => ({
  contractId: CONTRACT_ID,
  functionName: 'activate-escrow',
  functionArgs: [uintCV(id)],
});

export const buildSubmitMilestone = (id: number, index: number): ContractCall => ({
  contractId: CONTRACT_ID,
  functionName: 'submit-milestone',
  functionArgs: [uintCV(id), uintCV(index)],
});

export const buildApproveMilestone = (id: number, index: number): ContractCall => ({
  contractId: CONTRACT_ID,
  functionName: 'approve-milestone',
  functionArgs: [uintCV(id), uintCV(index)],
});

export const buildRaiseDispute = (id: number, index: number): ContractCall => ({
  contractId: CONTRACT_ID,
  functionName: 'raise-dispute',
  functionArgs: [uintCV(id), uintCV(index)],
});

export const buildResolveMilestone = (id: number, index: number, releaseToWorker: boolean): ContractCall => ({
  contractId: CONTRACT_ID,
  functionName: 'resolve-dispute',
  functionArgs: [uintCV(id), uintCV(index), boolCV(releaseToWorker)],
});

export const buildCancelEscrow = (id: number): ContractCall => ({
  contractId: CONTRACT_ID,
  functionName: 'cancel-escrow',
  functionArgs: [uintCV(id)],
});

// Dispute (arbitration layer)
export const buildOpenDispute = (
  escrowId: number,
  client: string,
  provider: string,
  disputedAmount: bigint,
  clientClaim: bigint,
  providerClaim: bigint,
  reason: string,
): ContractCall => ({
  contractId: DISPUTE_ID,
  functionName: 'open-dispute',
  functionArgs: [
    uintCV(escrowId),
    principalCV(client),
    principalCV(provider),
    uintCV(disputedAmount),
    uintCV(clientClaim),
    uintCV(providerClaim),
    stringUtf8CV(reason),
  ],
});

export const buildResolveDispute = (
  disputeId: number,
  clientAward: bigint,
  providerAward: bigint,
  notes: string,
): ContractCall => ({
  contractId: DISPUTE_ID,
  functionName: 'resolve-dispute',
  functionArgs: [uintCV(disputeId), uintCV(clientAward), uintCV(providerAward), stringUtf8CV(notes)],
});

export const buildWithdrawDispute = (disputeId: number): ContractCall => ({
  contractId: DISPUTE_ID,
  functionName: 'withdraw-dispute',
  functionArgs: [uintCV(disputeId)],
});

// ── Transaction polling ──────────────────────────────────────────────────────

export interface TxResult {
  status: string;
  repr: string;
}

/** Poll the tx until it leaves 'pending'; returns final status + result repr. */
export async function waitForTx(
  txid: string,
  { timeoutMs = 20 * 60000, intervalMs = 8000 }: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<TxResult> {
  const id = txid.startsWith('0x') ? txid : `0x${txid}`;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${API_BASE}/extended/v1/tx/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const status = String(json?.tx_status ?? 'pending');
        if (status !== 'pending') return { status, repr: String(json?.tx_result?.repr ?? '') };
      }
    } catch {
      // network hiccup — keep polling until the deadline
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return { status: 'pending', repr: '' };
}

/** Read a freshly-minted id out of an (ok uN) response repr. */
export function parseOkUint(repr: string): number | null {
  const m = repr?.match(/^\(ok\s+u(\d+)\)$/);
  return m ? Number(m[1]) : null;
}

// ── Explorer helpers ─────────────────────────────────────────────────────────
// On testnet the chain goes in the query string; mainnet needs no suffix.

const CHAIN_Q = IS_MAINNET ? '' : '?chain=testnet';

export const explorerTx = (txid: string): string => {
  const id = txid.startsWith('0x') ? txid : `0x${txid}`;
  return `https://explorer.hiro.so/txid/${id}${CHAIN_Q}`;
};

export const explorerAddress = (address: string): string =>
  `https://explorer.hiro.so/address/${address}${CHAIN_Q}`;

export const explorerContract = (contractId: string): string =>
  `https://explorer.hiro.so/txid/${contractId}${CHAIN_Q}`;
