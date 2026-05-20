import type { Escrow, Milestone, EscrowState, MilestoneState } from './contract';
import type { Role } from './types';

export function canSubmit(role: Role, ms: Milestone, escrow: Escrow): boolean {
  return role === 'worker' && ms.state === 'pending' && escrow.state === 'active';
}

export function canApprove(role: Role, ms: Milestone, escrow: Escrow): boolean {
  return role === 'client' && ms.state === 'submitted' && escrow.state === 'active';
}

export function canDispute(role: Role, ms: Milestone, escrow: Escrow): boolean {
  return (role === 'client' || role === 'worker') && ms.state === 'submitted' && escrow.state === 'active';
}

export function canResolve(role: Role, ms: Milestone, escrow: Escrow): boolean {
  return role === 'resolver' && ms.state === 'disputed' && escrow.state === 'disputed';
}
