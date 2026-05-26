import type { TimelineEvent } from '@/hooks/useEscrowTimeline';

export function auditToText(events: TimelineEvent[]): string {
  return events.map(ev => ev.block + '\t' + ev.type + '\t' + ev.label).join('\n');
}

export function downloadAudit(events: TimelineEvent[], escrowId: number) {
  const content = 'Block\tType\tLabel\n' + auditToText(events);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'escrow-' + escrowId + '-audit.txt'; a.click();
  URL.revokeObjectURL(url);
}
