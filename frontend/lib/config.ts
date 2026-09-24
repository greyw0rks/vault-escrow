// Static app configuration & on-chain limits (mirrors the Clarity constants).

export const APP_NAME = 'VaultSTX';

/** vaultstx-escrow: MAX-MILESTONES u20, description is (string-ascii 200). */
export const MAX_MILESTONES = 20;
export const MS_DESC_MAX = 200;

/** vaultstx-dispute: reason / resolution-notes are (string-utf8 256). */
export const DISPUTE_REASON_MAX = 256;
export const DISPUTE_NOTES_MAX = 256;

/** Stacks principal (mainnet SP / SM, testnet ST / SN). */
export const PRINCIPAL_RE = /^S[PTMN][0-9A-HJKMNP-Z]{37,40}$/;

/** How many escrows back a "My Escrows" / dispute scan reaches (no on-chain index). */
export const SCAN_WINDOW = 120;
