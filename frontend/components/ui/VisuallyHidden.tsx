import { srOnly } from '@/lib/accessibility';

export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span style={srOnly()}>{children}</span>;
}
