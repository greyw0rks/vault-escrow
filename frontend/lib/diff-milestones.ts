import type { Milestone } from './contract';

export interface MilestoneDiff {
  index: number;
  from: Milestone['state'];
  to: Milestone['state'];
}

export function diffMilestones(prev: Milestone[], next: Milestone[]): MilestoneDiff[] {
  const diffs: MilestoneDiff[] = [];
  const len = Math.min(prev.length, next.length);
  for (let i = 0; i < len; i++) {
    if (prev[i].state !== next[i].state) {
      diffs.push({ index: i, from: prev[i].state, to: next[i].state });
    }
  }
  return diffs;
}
