import Link from 'next/link';

interface Props {
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function EmptyState({ message, ctaLabel, ctaHref }: Props) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '1rem', padding: '3rem 1.5rem', color: 'var(--muted)',
      fontFamily: "'DM Sans',sans-serif", textAlign: 'center',
    }}>
      <div style={{ fontSize: '2rem', opacity: .35 }}>⬡</div>
      <p style={{ margin: 0 }}>{message}</p>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="btn-primary">{ctaLabel}</Link>
      )}
    </div>
  );
}
