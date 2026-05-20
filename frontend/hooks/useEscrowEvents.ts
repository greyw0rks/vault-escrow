'use client';
import { useEffect } from 'react';
import { eventBus, EVENTS } from '@/lib/events';

export function useEscrowEvents(escrowId: number | null, onUpdate: () => void) {
  useEffect(() => {
    if (!escrowId) return;
    const off = eventBus.on(EVENTS.ESCROW_UPDATED, (id) => {
      if (id === escrowId) onUpdate();
    });
    return off;
  }, [escrowId, onUpdate]);
}
