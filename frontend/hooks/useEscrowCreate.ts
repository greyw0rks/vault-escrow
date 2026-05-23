'use client';
import { useContractCall } from './useContractCall';
import { buildCreateEscrow, buildAddMilestone, buildActivateEscrow, stxToMicro } from '@/lib/contract';

interface MilestoneEntry { description: string; amount: string; }

export function useEscrowCreate() {
  const { call, loading, error, txId } = useContractCall();

  const createEscrow = (worker: string, resolver: string, deposit: string, onSuccess?: () => void) =>
    call(buildCreateEscrow(worker, resolver, stxToMicro(deposit)), onSuccess);

  const addMilestone = (escrowId: number, description: string, amount: string, onSuccess?: () => void) =>
    call(buildAddMilestone(escrowId, description, stxToMicro(amount)), onSuccess);

  const activate = (escrowId: number, onSuccess?: () => void) =>
    call(buildActivateEscrow(escrowId), onSuccess);

  return { createEscrow, addMilestone, activate, loading, error, txId };
}
