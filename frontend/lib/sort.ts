import type { Escrow } from './contract';

export const byIdDesc   = (a: Escrow, b: Escrow) => b.id - a.id;
export const byIdAsc    = (a: Escrow, b: Escrow) => a.id - b.id;
export const byAmountDesc = (a: Escrow, b: Escrow) => Number(b.totalAmount - a.totalAmount);
export const byAmountAsc  = (a: Escrow, b: Escrow) => Number(a.totalAmount - b.totalAmount);
export const byCreatedDesc = (a: Escrow, b: Escrow) => b.createdAt - a.createdAt;

export const SORT_OPTIONS = [
  { label: 'Newest', fn: byCreatedDesc },
  { label: 'ID ↑',  fn: byIdAsc },
  { label: 'ID ↓',  fn: byIdDesc },
  { label: 'Amount ↓', fn: byAmountDesc },
  { label: 'Amount ↑', fn: byAmountAsc },
] as const;
