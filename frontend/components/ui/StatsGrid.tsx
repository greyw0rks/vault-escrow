import { StatCard } from './StatCard';
import { microToSTX } from '@/lib/contract';

interface Stats {
  total: number;
  active: number;
  disputed: number;
  complete: number;
  totalLocked: bigint;
  totalReleased: bigint;
}

export function StatsGrid({ stats }: { stats: Stats }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '.75rem', marginBottom: '1.75rem' }}>
      <StatCard label="Total"    value={stats.total} />
      <StatCard label="Active"   value={stats.active} color="#1D9E75" />
      <StatCard label="Disputed" value={stats.disputed} color="#A32D2D" />
      <StatCard label="Complete" value={stats.complete} />
      <StatCard label="Locked"   value={microToSTX(stats.totalLocked) + ' STX'} />
      <StatCard label="Released" value={microToSTX(stats.totalReleased) + ' STX'} color="#1D9E75" />
    </div>
  );
}
