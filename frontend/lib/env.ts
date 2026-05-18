export const ENV = {
  network:         process.env.NEXT_PUBLIC_NETWORK ?? 'testnet',
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '',
  isMainnet:       process.env.NEXT_PUBLIC_NETWORK === 'mainnet',
  apiBase:         process.env.NEXT_PUBLIC_NETWORK === 'mainnet'
                     ? 'https://api.hiro.so'
                     : 'https://api.testnet.hiro.so',
} as const;

export function assertEnv() {
  if (!ENV.contractAddress) throw new Error('NEXT_PUBLIC_CONTRACT_ADDRESS is not set');
}
