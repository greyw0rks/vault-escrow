import { cn } from '@/lib/cn';

/** Big telemetry stat tile. Label on top (mono), oversized value below (macro).
 *  `phosphor` renders terminal-green — reserved for the live STX-held readout. */
export function Stat({
  label, value, sub, accent, phosphor, className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: boolean;
  phosphor?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('bg-panel p-5', className)}>
      <div className="tele font-bold">{label}</div>
      <div
        className={cn(
          'macro mt-1 text-4xl md:text-5xl',
          accent && 'text-hazard',
          phosphor && 'phosphor',
        )}
      >
        {value}
      </div>
      {sub && <div className="mono mt-1 text-[0.7rem] uppercase tracking-widest text-dim">{sub}</div>}
    </div>
  );
}
