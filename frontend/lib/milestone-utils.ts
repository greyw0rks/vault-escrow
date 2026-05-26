import type { Milestone, MilestoneState } from './contract';

export function isActionable(ms: Milestone): boolean {
  return ms.state === 'pending' || ms.state === 'submitted' || ms.state === 'disputed';
}

export function isTerminal(ms: Milestone): boolean {
  return ms.state === 'approved';
}

export function nextExpectedState(ms: Milestone): MilestoneState | null {
  if (ms.state === 'pending')   return 'submitted';
  if (ms.state === 'submitted') return 'approved';
  if (ms.state === 'disputed')  return 'approved';
  return null;
}

export function milestoneLabel(ms: Milestone, index: number): string {
  return 'Milestone ' + (index + 1) + ': ' + ms.description.slice(0, 40);
}
