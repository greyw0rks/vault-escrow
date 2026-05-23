'use client';
import { NetworkBadge } from './NetworkBadge';
import { BlockHeightBadge } from './BlockHeightBadge';
import { STXPriceTicker } from './STXPriceTicker';

export function ChainInfo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <NetworkBadge />
      <BlockHeightBadge />
      <STXPriceTicker />
    </div>
  );
}
