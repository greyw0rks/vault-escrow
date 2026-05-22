import type { Escrow } from './contract';
import { microToSTX, truncatePrincipal } from './contract';

export function escrowsToCSV(escrows: Escrow[]): string {
  const headers = ['ID', 'State', 'Client', 'Worker', 'Total STX', 'Released STX', 'Milestones', 'Created Block'];
  const rows = escrows.map(e => [
    e.id,
    e.state,
    e.client,
    e.worker,
    microToSTX(e.totalAmount),
    microToSTX(e.released),
    e.milestoneCount,
    e.createdAt,
  ]);
  return [headers, ...rows].map(r => r.join(',')).join('\n');
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
