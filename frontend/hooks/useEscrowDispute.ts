'use client';
import { useContractCall } from './useContractCall';
import { buildRaiseDispute, buildResolveDispute } from '@/lib/contract';

export function useEscrowDispute(escrowId: number, milestoneIndex: number, onSuccess?: () => void) {
  const { call, loading, error, txId } = useContractCall();

  const raise = () => call(buildRaiseDispute(escrowId, milestoneIndex), onSuccess);
  const resolve = (toWorker: boolean) => call(buildResolveDispute(escrowId, milestoneIndex, toWorker), onSuccess);

  return { raise, resolve, loading, error, txId };
}
