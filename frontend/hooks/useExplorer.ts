import { explorerTxUrl, explorerAddressUrl } from '@/lib/network';

export function useExplorer() {
  const openTx = (txId: string) => window.open(explorerTxUrl(txId), '_blank', 'noopener');
  const openAddress = (address: string) => window.open(explorerAddressUrl(address), '_blank', 'noopener');
  return { openTx, openAddress };
}
