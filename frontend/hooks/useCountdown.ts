'use client';
import { useState, useEffect } from 'react';
import { useBlockHeight } from './useBlockHeight';

export function useCountdown(targetBlock: number) {
  const current = useBlockHeight();
  const blocksLeft = Math.max(0, targetBlock - current);
  const BLOCK_MS = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 600_000 : 120_000;
  const msLeft = blocksLeft * BLOCK_MS;

  const hours = Math.floor(msLeft / 3_600_000);
  const mins  = Math.floor((msLeft % 3_600_000) / 60_000);

  return {
    blocksLeft,
    msLeft,
    formatted: blocksLeft === 0 ? 'now' : hours > 0 ? hours + 'h ' + mins + 'm' : mins + 'm',
    reached: blocksLeft === 0,
  };
}
