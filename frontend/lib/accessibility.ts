export function ariaLabel(label: string): { 'aria-label': string } {
  return { 'aria-label': label };
}

export function ariaExpanded(expanded: boolean): { 'aria-expanded': boolean } {
  return { 'aria-expanded': expanded };
}

export function ariaHidden(hidden = true): { 'aria-hidden': boolean } {
  return { 'aria-hidden': hidden };
}

export function srOnly(): React.CSSProperties {
  return { position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 };
}
