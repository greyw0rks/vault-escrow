'use client';
import type { Escrow } from '@/lib/contract';
import { escrowsToCSV, downloadCSV } from '@/lib/csv';

export function ExportButton({ escrows }: { escrows: Escrow[] }) {
  const handleExport = () => {
    const csv = escrowsToCSV(escrows);
    downloadCSV(csv, 'vaultstx-escrows-' + new Date().toISOString().slice(0, 10) + '.csv');
  };
  return (
    <button className="btn-ghost" onClick={handleExport} style={{ padding: '.35rem .875rem', fontSize: '.8125rem' }}
      disabled={escrows.length === 0}>
      ↓ Export CSV
    </button>
  );
}
