interface Props {
  page: number;
  totalPages: number;
  onNext: () => void;
  onPrev: () => void;
}

export function Pagination({ page, totalPages, onNext, onPrev }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
      <button className="btn-ghost" onClick={onPrev} disabled={page === 0} style={{ padding: '.35rem .875rem', fontSize: '.8125rem' }}>← Prev</button>
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--muted)' }}>{page + 1} / {totalPages}</span>
      <button className="btn-ghost" onClick={onNext} disabled={page === totalPages - 1} style={{ padding: '.35rem .875rem', fontSize: '.8125rem' }}>Next →</button>
    </div>
  );
}
