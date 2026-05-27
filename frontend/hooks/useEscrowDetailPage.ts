'use client';
import { useEscrowById } from './useEscrowById';
import { useWallet } from './useWallet';
import { useEscrowRole } from './useEscrowRole';
import { useEscrowActions } from './useEscrowActions';
import { useMilestoneProgress } from './useMilestoneProgress';
import { useEscrowHistory } from './useEscrowHistory';

export function useEscrowDetailPage() {
  const { connected, address } = useWallet();
  const { escrow, milestones, loading, error, refetch, escrowId } = useEscrowById();
  const role     = useEscrowRole(escrow, address);
  const actions  = useEscrowActions(escrow?.id ?? 0, escrow?.activeMilestone ?? 0, refetch);
  const progress = useMilestoneProgress(milestones);
  useEscrowHistory(escrowId);

  return {
    connected, address, escrow, milestones, loading, error, refetch,
    role, actions, progress,
    isClient:   role === 'client',
    isWorker:   role === 'worker',
    isResolver: role === 'resolver',
  };
}
