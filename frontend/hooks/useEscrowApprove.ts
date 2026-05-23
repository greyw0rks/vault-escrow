'use client';
import { useContractCall } from './useContractCall';
import { buildApproveMilestone } from '@/lib/contract';

export function useEscrowApprove(escrowId: number, onSuccess?: () => void) {
  const { call, loading, error, txId } = useContractCall();
  const approve = (milestoneIndex: number) =>
    call(buildApproveMilestone(escrowId, milestoneIndex), onSuccess);
  return { approve, loading, error, txId };
}
