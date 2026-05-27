import { getBlockHeight } from './stacks-api';
import { ENV } from './env';

export interface HealthStatus {
  api:      'ok' | 'error';
  contract: 'configured' | 'missing';
  network:  string;
  block:    number;
}

export async function checkHealth(): Promise<HealthStatus> {
  let block = 0;
  let apiStatus: 'ok' | 'error' = 'error';
  try { block = await getBlockHeight(); apiStatus = 'ok'; } catch {}
  return {
    api:      apiStatus,
    contract: ENV.contractAddress ? 'configured' : 'missing',
    network:  ENV.network,
    block,
  };
}
