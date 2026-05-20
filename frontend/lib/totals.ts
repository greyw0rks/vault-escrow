export function sumMilestones(milestones: { amount: string }[]): number {
  return milestones.reduce((acc, m) => acc + parseFloat(m.amount || '0'), 0);
}

export function milestonesMatchDeposit(milestones: { amount: string }[], deposit: string): boolean {
  const sum = sumMilestones(milestones);
  const dep = parseFloat(deposit || '0');
  return Math.abs(sum - dep) < 0.000001;
}

export function remainingAmount(milestones: { amount: string }[], deposit: string): number {
  return parseFloat(deposit || '0') - sumMilestones(milestones);
}
