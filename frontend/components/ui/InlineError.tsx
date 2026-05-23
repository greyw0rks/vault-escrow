export function InlineError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span style={{
      fontSize: '.75rem', color: '#A32D2D',
      fontFamily: "'DM Sans',sans-serif",
      display: 'flex', alignItems: 'center', gap: '.25rem',
    }}>
      ⚠ {message}
    </span>
  );
}
