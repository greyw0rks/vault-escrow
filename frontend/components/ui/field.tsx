import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

const fieldBase =
  'w-full border-2 border-line bg-panel px-3 py-2.5 font-mono text-sm text-fg ' +
  'placeholder:text-dim focus:outline-none focus:bg-panel-2 focus:border-hazard';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldBase, className)} {...props} />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldBase, 'resize-none leading-relaxed', className)} {...props} />
  ),
);
Textarea.displayName = 'Textarea';

export function Field({
  label, hint, children, count,
}: {
  label: string;
  hint?: string;
  count?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="tele font-bold text-fg-2">{label}</span>
        {count && <span className="mono text-[0.7rem] text-dim">{count}</span>}
      </div>
      {children}
      {hint && <p className="mt-1.5 mono text-[0.7rem] text-dim">{hint}</p>}
    </label>
  );
}
