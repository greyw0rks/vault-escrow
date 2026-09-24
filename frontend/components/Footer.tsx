import { CONTRACT_ID, DISPUTE_ID, FACTORY_ID, explorerContract, NETWORK_NAME } from '@/lib/contract';
import { APP_NAME } from '@/lib/config';

const CONTRACTS = [
  { label: 'ESCROW / CORE', id: CONTRACT_ID },
  { label: 'DISPUTE / ARBITRATION', id: DISPUTE_ID },
  { label: 'FACTORY / REGISTRY', id: FACTORY_ID },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-line">
      <div className="hazard-stripe h-3" />
      <div className="mx-auto grid max-w-[1400px] gap-px bg-line md:grid-cols-3">
        <div className="bg-bg p-6">
          <div className="macro text-2xl">{APP_NAME}<span className="text-hazard">®</span></div>
          <p className="mt-2 mono text-[0.7rem] text-dim">
            TRUSTLESS MILESTONE ESCROW / STACKS MAINNET / STX-LOCKED VAULTS
          </p>
        </div>
        <div className="bg-bg p-6">
          <div className="tele mb-2">CONTRACTS</div>
          <dl className="space-y-2">
            {CONTRACTS.map((c) => (
              <div key={c.label}>
                <dt className="mono text-[0.6rem] uppercase tracking-widest text-dim">{c.label}</dt>
                <dd>
                  <a
                    href={explorerContract(c.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="mono block break-all text-xs text-fg underline decoration-hazard decoration-2 underline-offset-2"
                  >
                    {c.id || '— NOT CONFIGURED —'}
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="bg-bg p-6">
          <div className="tele mb-2">SYSTEM</div>
          <dl className="mono space-y-1 text-xs">
            <div className="flex justify-between"><dt className="text-dim">NETWORK</dt><dd className="uppercase">{NETWORK_NAME}</dd></div>
            <div className="flex justify-between"><dt className="text-dim">REV</dt><dd>2.0</dd></div>
            <div className="flex justify-between"><dt className="text-dim">UNIT</dt><dd>VLT / D-01</dd></div>
          </dl>
        </div>
      </div>
    </footer>
  );
}
