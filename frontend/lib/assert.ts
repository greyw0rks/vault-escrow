export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error('[VaultSTX] Assertion failed: ' + message);
}

export function assertDefined<T>(value: T | null | undefined, message: string): T {
  if (value == null) throw new Error('[VaultSTX] Expected defined: ' + message);
  return value;
}

export function assertNonEmpty(str: string, field: string): void {
  assert(str.trim().length > 0, field + ' must not be empty');
}
