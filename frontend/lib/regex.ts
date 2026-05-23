export const PRINCIPAL_RE  = /^S[A-Z0-9]{28,41}$/;
export const TX_HASH_RE     = /^0x[a-fA-F0-9]{64}$/;
export const STX_AMOUNT_RE  = /^\d+(\.\d{1,6})?$/;
export const BLOCK_HEIGHT_RE = /^\d+$/;

export function isPrincipal(s: string): boolean  { return PRINCIPAL_RE.test(s); }
export function isTxHash(s: string): boolean      { return TX_HASH_RE.test(s); }
export function isSTXAmount(s: string): boolean   { return STX_AMOUNT_RE.test(s) && parseFloat(s) > 0; }
