'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchEscrow, fetchAllMilestones, type Escrow, type Milestone } from '@/lib/contract';

export function useEscrow(id: number | null) {
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const e = await fetchEscrow(id);
      if (!e) { setError('Escrow not found'); return; }
      const ms = await fetchAllMilestones(e);
      setEscrow(e);
      setMilestones(ms);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const progress = escrow && escrow.milestoneCount > 0
    ? Math.round((milestones.filter(m => m.state === 'approved').length / escrow.milestoneCount) * 100)
    : 0;

  return { escrow, milestones, progress, loading, error, refetch: load };
}
