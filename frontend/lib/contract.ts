import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  principalCV,
  stringAsciiCV,
  boolCV,
  fetchCallReadOnlyFunction,
  cvToValue,
} from '@stacks/transactions';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

const IS_MAINNET = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';
export const NETWORK = IS_MAINNET ? STACKS_MAINNET : STACKS_TESTNET;

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
export const CONTRACT_NAME    = 'vaultstx-escrow';

export type EscrowState = 'open' | 'active' | 'disputed' | 'complete' | 'cancelled';
export type MilestoneState = 'pending' | 'submitted' | 'approved' | 'disputed';

export interface Escrow {
  id:              number;
  client:          string;
  worker:          string;
  resolver:        string;
  totalAmount:     bigint;
  deposited:       bigint;
  released:        bigint;
  milestoneCount:  number;
  activeMilestone: number;
  state:           EscrowState;
  createdAt:       number;
}

export interface Milestone {
  description:    string;
  amount:         bigint;
  state:          MilestoneState;
  blockSubmitted: number;
  blockResolved:  number;
}

const ESCROW_STATES: EscrowState[] = ['open', 'active', 'disputed', 'complete', 'cancelled'];
const MS_STATES: MilestoneState[]  = ['pending', 'submitted', 'approved', 'disputed'];

export async function fetchEscrow(id: number): Promise<Escrow | null> {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName:    CONTRACT_NAME,
    functionName:    'get-escrow',
    functionArgs:    [uintCV(id)],
    network:         NETWORK,
    senderAddress:   CONTRACT_ADDRESS,
  });
  const val = cvToValue(result);
  if (!val) return null;
  return {
    id,
    client:          val.client,
    worker:          val.worker,
    resolver:        val.resolver,
    totalAmount:     BigInt(val['total-amount']),
    deposited:       BigInt(val.deposited),
    released:        BigInt(val.released),
    milestoneCount:  Number(val['milestone-count']),
    activeMilestone: Number(val['active-milestone']),
    state:           ESCROW_STATES[Number(val.state)],
    createdAt:       Number(val['created-at']),
  };
}

export async function fetchMilestone(escrowId: number, index: number): Promise<Milestone | null> {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName:    CONTRACT_NAME,
    functionName:    'get-milestone',
    functionArgs:    [uintCV(escrowId), uintCV(index)],
    network:         NETWORK,
    senderAddress:   CONTRACT_ADDRESS,
  });
  const val = cvToValue(result);
  if (!val) return null;
  return {
    description:    val.description,
    amount:         BigInt(val.amount),
    state:          MS_STATES[Number(val.state)],
    blockSubmitted: Number(val['block-submitted']),
    blockResolved:  Number(val['block-resolved']),
  };
}

export async function fetchAllMilestones(escrow: Escrow): Promise<Milestone[]> {
  const fetches = Array.from({ length: escrow.milestoneCount }, (_, i) =>
    fetchMilestone(escrow.id, i)
  );
  const results = await Promise.all(fetches);
  return results.filter(Boolean) as Milestone[];
}

export function buildCreateEscrow(worker: string, resolver: string, deposit: bigint) {
  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName:    CONTRACT_NAME,
    functionName:    'create-escrow',
    functionArgs:    [principalCV(worker), principalCV(resolver), uintCV(deposit)],
    network:         NETWORK,
    anchorMode:      AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
  };
}

export function buildAddMilestone(escrowId: number, description: string, amount: bigint) {
  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName:    CONTRACT_NAME,
    functionName:    'add-milestone',
    functionArgs:    [uintCV(escrowId), stringAsciiCV(description), uintCV(amount)],
    network:         NETWORK,
    anchorMode:      AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
  };
}

export function buildActivateEscrow(escrowId: number) {
  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName:    CONTRACT_NAME,
    functionName:    'activate-escrow',
    functionArgs:    [uintCV(escrowId)],
    network:         NETWORK,
    anchorMode:      AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
  };
}

export function buildSubmitMilestone(escrowId: number, index: number) {
  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName:    CONTRACT_NAME,
    functionName:    'submit-milestone',
    functionArgs:    [uintCV(escrowId), uintCV(index)],
    network:         NETWORK,
    anchorMode:      AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
  };
}

export function buildApproveMilestone(escrowId: number, index: number) {
  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName:    CONTRACT_NAME,
    functionName:    'approve-milestone',
    functionArgs:    [uintCV(escrowId), uintCV(index)],
    network:         NETWORK,
    anchorMode:      AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
  };
}

export function buildRaiseDispute(escrowId: number, index: number) {
  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName:    CONTRACT_NAME,
    functionName:    'raise-dispute',
    functionArgs:    [uintCV(escrowId), uintCV(index)],
    network:         NETWORK,
    anchorMode:      AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
  };
}

export function buildResolveDispute(escrowId: number, index: number, releaseToWorker: boolean) {
  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName:    CONTRACT_NAME,
    functionName:    'resolve-dispute',
    functionArgs:    [uintCV(escrowId), uintCV(index), boolCV(releaseToWorker)],
    network:         NETWORK,
    anchorMode:      AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
  };
}

export function microToSTX(micro: bigint): string {
  return (Number(micro) / 1_000_000).toFixed(6).replace(/\.?0+$/, '');
}

export function stxToMicro(stx: string): bigint {
  return BigInt(Math.round(parseFloat(stx) * 1_000_000));
}

export function truncatePrincipal(p: string, chars = 6): string {
  return `${p.slice(0, chars)}\u2026${p.slice(-4)}`;
}
