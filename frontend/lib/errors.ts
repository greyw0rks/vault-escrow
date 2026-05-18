export const CONTRACT_ERRORS: Record<number, string> = {
  100: 'Not authorized',
  101: 'Escrow not found',
  102: 'Invalid milestone index',
  103: 'Wrong escrow state',
  104: 'Wrong milestone state',
  105: 'Insufficient deposit',
  106: 'Milestone amount mismatch',
};

export function parseContractError(code: number): string {
  return CONTRACT_ERRORS[code] ?? 'Contract error (' + code + ')';
}
