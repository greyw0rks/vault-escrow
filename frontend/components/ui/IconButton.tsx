'use client';
import { Tooltip } from './Tooltip';

interface Props {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  size?: number;
}

export function IconButton({ icon, label, onClick, disabled, size = 32 }: Props) {
  return (
    <Tooltip content={label}>
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        style={{
          width: size, height: size,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', cursor: disabled ? 'not-allowed' : 'pointer',
          color: disabled ? 'var(--muted)' : 'var(--text)',
          fontSize: size * 0.45 + 'px', transition: 'border-color .15s',
          opacity: disabled ? .5 : 1,
        }}>
        {icon}
      </button>
    </Tooltip>
  );
}
