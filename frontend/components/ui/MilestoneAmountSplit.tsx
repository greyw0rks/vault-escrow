'use client';
import { splitEqually } from '@/lib/math';
import { microToSTX, stxToMicro } from '@/lib/contract';

interface Props {
  deposit: string;
  count: number;
  onApply: (amounts: string[]) => void;
}

export function MilestoneAmountSplit({ deposit, count, onApply }: Props) {
  if (!deposit || count === 0) return null;
  const micro = stxToMicro(deposit);
  const splits = splitEqually(micro, count).map(a => microToSTX(a));

  return (
    <button
      type="button"
      className="btn-ghost"
      style={{ fontSize: '.8125rem', padding: '.35rem .75rem' }}
      onClick={() => onApply(splits)}
    >
      ÷ Split equally ({microToSTX(micro / BigInt(count))} STX each)
    </button>
  );
}
