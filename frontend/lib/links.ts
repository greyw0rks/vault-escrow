export const LINKS = {
  github:      'https://github.com/greyw0rks/vault-escrow',
  npm:         'https://www.npmjs.com/package/@greyw0rks/vault-escrow',
  hirosystems: 'https://docs.hiro.so',
  stacks:      'https://www.stacks.co',
  clarity:     'https://docs.stacks.co/clarity',
} as const;

export function explorerLink(type: 'tx' | 'address', value: string, mainnet = false): string {
  const base = mainnet ? 'https://explorer.hiro.so' : 'https://explorer.hiro.so/?chain=testnet';
  return type === 'tx' ? base + '/txid/' + value : base + '/address/' + value;
}
