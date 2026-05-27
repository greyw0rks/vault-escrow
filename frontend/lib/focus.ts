export function focusFirst(container: HTMLElement): void {
  const el = container.querySelector<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])');
  el?.focus();
}

export function focusById(id: string): void {
  document.getElementById(id)?.focus();
}
