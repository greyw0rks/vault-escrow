import { explorerLink } from '@/lib/links';
import { ENV } from '@/lib/env';

export function useExternalLinks() {
  const isMainnet = ENV.isMainnet;

  return {
    txLink:      (txId: string)      => explorerLink('tx',      txId,    isMainnet),
    addressLink: (address: string)   => explorerLink('address', address, isMainnet),
    contractLink: () => explorerLink('address', ENV.contractAddress, isMainnet),
  };
}
