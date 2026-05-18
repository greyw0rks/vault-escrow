import type { Escrow } from '@/lib/contract';
import type { Role } from '@/lib/types';

export function useEscrowRole(escrow: Escrow | null, address: string | null): Role {
  if (!escrow || !address) return 'observer';
  if (escrow.client === address) return 'client';
  if (escrow.worker === address) return 'worker';
  if (escrow.resolver === address) return 'resolver';
  return 'observer';
}
