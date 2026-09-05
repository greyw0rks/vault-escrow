import {
  uintCV,
  principalCV,
  stringAsciiCV,
  boolCV,
  fetchCallReadOnlyFunction,
  type ClarityValue,
} from '@stacks/transactions';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

const IS_MAINNET = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';

export const NETWORK = IS_MAINNET ? STACKS_MAINNET : STACKS_TESTNET;
export const NETWORK_NAME = IS_MAINNET ? 'mainnet' : 'testnet';
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '';
export const CONTRACT_NAME = 'vaultstx-escrow';
export const CONTRACT_ID = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;

const API_BASE = IS_MAINNET ? 'https://api.hiro.so' : 'https://api.testnet.hiro.so';

export type EscrowState = 'open' | 'active' | 'disputed' | 'complete' | 'cancelled';
export type MilestoneState = 'pending' | 'submitted' | 'approved' | 'disputed';

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

/** Index order must match the STATE-* / MS-* constants in vaultstx-escrow.clar. */
const ESCROW_STATES: EscrowState[] = ['open', 'active', 'disputed', 'complete', 'cancelled'];
const MS_STATES: MilestoneState[] = ['pending', 'submitted', 'approved', 'disputed'];

// ── Clarity value decoding ────────────────────────────────────────────────────
// get-escrow returns (optional (tuple ...)). cvToValue() unwraps only the
// optional, leaving each field as a {type, value} pair — so reading `val.client`
// yields undefined. Booleans are the subtle case: they carry no `value` at all
// and encode as type 'true' / 'false'.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawCV = any;

const unwrapOptional = (cv: RawCV): RawCV | null =>
  cv?.type === 'some' ? cv.value : cv?.type === 'none' ? null : cv;

const fields = (cv: RawCV): Record<string, RawCV> => cv?.value ?? {};
const asBigInt = (cv: RawCV): bigint => BigInt(cv?.value ?? 0);
const asNumber = (cv: RawCV): number => Number(cv?.value ?? 0);
const asString = (cv: RawCV): string => String(cv?.value ?? '');

async function ro(fn: string, args: ClarityValue[]) {
  if (!CONTRACT_ADDRESS)
    throw new Error('NEXT_PUBLIC_CONTRACT_ADDRESS is not set — copy .env.example to .env.local');
  return fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: fn,
    functionArgs: args,
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS,
  });
}

// ── Reads ─────────────────────────────────────────────────────────────────────

export async function fetchBlockHeight(): Promise<number> {
  const res = await fetch(`${API_BASE}/v2/info`);
  if (!res.ok) throw new Error(`Hiro /v2/info returned ${res.status}`);
  return Number((await res.json()).stacks_tip_height ?? 0);
}

/** Highest escrow id in existence. get-next-id points one past the last. */
export async function fetchEscrowCount(): Promise<number> {
  return Math.max(0, asNumber(await ro('get-next-id', [])) - 1);
}

export async function fetchEscrow(id: number): Promise<Escrow | null> {
  const tuple = unwrapOptional(await ro('get-escrow', [uintCV(id)]));
  if (!tuple) return null;
  const f = fields(tuple);
  return {
    id,
    client: asString(f.client),
    worker: asString(f.worker),
    resolver: asString(f.resolver),
    totalAmount: asBigInt(f['total-amount']),
    deposited: asBigInt(f.deposited),
    released: asBigInt(f.released),
    milestoneCount: asNumber(f['milestone-count']),
    activeMilestone: asNumber(f['active-milestone']),
    state: ESCROW_STATES[asNumber(f.state)] ?? 'open',
    createdAt: asNumber(f['created-at']),
  };
}

export async function fetchMilestone(escrowId: number, index: number): Promise<Milestone | null> {
  const tuple = unwrapOptional(await ro('get-milestone', [uintCV(escrowId), uintCV(index)]));
  if (!tuple) return null;
  const f = fields(tuple);
  return {
    index,
    description: asString(f.description),
    amount: asBigInt(f.amount),
    state: MS_STATES[asNumber(f.state)] ?? 'pending',
    blockSubmitted: asNumber(f['block-submitted']),
    blockResolved: asNumber(f['block-resolved']),
  };
}

export async function fetchAllMilestones(escrow: Escrow): Promise<Milestone[]> {
  const results = await Promise.all(
    Array.from({ length: escrow.milestoneCount }, (_, i) =>
      fetchMilestone(escrow.id, i).catch(() => null)),
  );
  return results.filter(Boolean) as Milestone[];
}

/** Undistributed STX still held for an escrow. */
export async function fetchRemaining(id: number): Promise<bigint> {
  return asBigInt(await ro('get-remaining', [uintCV(id)]));
}

export const PAGE_SIZE = 24;

/**
 * One page of escrows, newest first. Paged deliberately: mainnet holds
 * ~1,800 escrows, so loading "all" of them would fire that many read-only
 * calls on a single page view.
 */
export async function fetchEscrowPage(
  highestId: number,
  offset = 0,
  limit = PAGE_SIZE,
): Promise<Escrow[]> {
  if (highestId < 1) return [];
  const start = highestId - offset;
  const ids: number[] = [];
  for (let id = start; id > start - limit && id >= 1; id--) ids.push(id);
  const results = await Promise.all(ids.map((id) => fetchEscrow(id).catch(() => null)));
  return results.filter(Boolean) as Escrow[];
}

/** Escrows where the address is client, worker or resolver. */
export async function fetchEscrowsForAddress(
  address: string,
  highestId: number,
  scanLimit = 120,
): Promise<Escrow[]> {
  const page = await fetchEscrowPage(highestId, 0, scanLimit);
  return page.filter((e) => e.client === address || e.worker === address || e.resolver === address);
}

// ── Write payloads ────────────────────────────────────────────────────────────
// Shaped for @stacks/connect's `request('stx_callContract', …)`, which takes the
// contract id plus args and handles network, anchor mode and nonce itself.

export type ContractCall = { functionName: string; functionArgs: ClarityValue[] };

export function buildCreateEscrow(worker: string, resolver: string, deposit: bigint): ContractCall {
  return {
    functionName: 'create-escrow',
    functionArgs: [principalCV(worker), principalCV(resolver), uintCV(deposit)],
  };
}

export function buildAddMilestone(escrowId: number, description: string, amount: bigint): ContractCall {
  return {
    functionName: 'add-milestone',
    functionArgs: [uintCV(escrowId), stringAsciiCV(description), uintCV(amount)],
  };
}

export function buildActivateEscrow(escrowId: number): ContractCall {
  return { functionName: 'activate-escrow', functionArgs: [uintCV(escrowId)] };
}

export function buildSubmitMilestone(escrowId: number, index: number): ContractCall {
  return { functionName: 'submit-milestone', functionArgs: [uintCV(escrowId), uintCV(index)] };
}

export function buildApproveMilestone(escrowId: number, index: number): ContractCall {
  return { functionName: 'approve-milestone', functionArgs: [uintCV(escrowId), uintCV(index)] };
}

export function buildRaiseDispute(escrowId: number, index: number): ContractCall {
  return { functionName: 'raise-dispute', functionArgs: [uintCV(escrowId), uintCV(index)] };
}

export function buildResolveDispute(escrowId: number, index: number, releaseToWorker: boolean): ContractCall {
  return {
    functionName: 'resolve-dispute',
    functionArgs: [uintCV(escrowId), uintCV(index), boolCV(releaseToWorker)],
  };
}

export function buildCancelEscrow(escrowId: number): ContractCall {
  return { functionName: 'cancel-escrow', functionArgs: [uintCV(escrowId)] };
}

// ── Formatting and links ──────────────────────────────────────────────────────

export function microToSTX(micro: bigint): string {
  const s = (Number(micro) / 1_000_000).toFixed(6);
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}

export function stxToMicro(stx: string): bigint {
  const n = parseFloat(stx);
  if (!Number.isFinite(n) || n < 0) return 0n;
  return BigInt(Math.round(n * 1_000_000));
}

export function truncatePrincipal(p: string, chars = 6): string {
  if (!p) return '';
  return `${p.slice(0, chars)}…${p.slice(-4)}`;
}

// The chain goes in the query string, so it must follow the path segment.
const explorer = (kind: 'txid' | 'address', value: string) =>
  IS_MAINNET
    ? `https://explorer.hiro.so/${kind}/${value}`
    : `https://explorer.hiro.so/${kind}/${value}?chain=testnet`;

export const explorerTxUrl = (txId: string) =>
  explorer('txid', txId.startsWith('0x') ? txId : `0x${txId}`);
export const explorerAddressUrl = (address: string) => explorer('address', address);
export const explorerContractUrl = () => explorer('address', CONTRACT_ID);
