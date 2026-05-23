'use client';
import { useContractCall } from './useContractCall';
import { buildSubmitMilestone } from '@/lib/contract';

export function useEscrowSubmit(escrowId: number, onSuccess?: () => void) {
  const { call, loading, error, txId } = useContractCall();
  const submit = (milestoneIndex: number) =>
    call(buildSubmitMilestone(escrowId, milestoneIndex), onSuccess);
  return { submit, loading, error, txId };
}
