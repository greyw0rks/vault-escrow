import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

const IS_MAINNET = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';

export const NETWORK = IS_MAINNET ? STACKS_MAINNET : STACKS_TESTNET;

export const API_BASE = IS_MAINNET
  ? 'https://api.hiro.so'
  : 'https://api.testnet.hiro.so';

export const EXPLORER_BASE = IS_MAINNET
  ? 'https://explorer.hiro.so'
  : 'https://explorer.hiro.so/?chain=testnet';

export function explorerTxUrl(txId: string): string {
  return EXPLORER_BASE + '/txid/' + txId;
}

export function explorerAddressUrl(address: string): string {
  return EXPLORER_BASE + '/address/' + address;
}
