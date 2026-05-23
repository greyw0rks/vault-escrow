export const ROUTES = {
  home:        '/',
  dashboard:   '/dashboard',
  newEscrow:   '/escrow/new',
  escrow: (id: number) => '/escrow/' + id,
} as const;

export function escrowUrl(id: number): string {
  return typeof window !== 'undefined'
    ? window.location.origin + ROUTES.escrow(id)
    : ROUTES.escrow(id);
}

export function isEscrowRoute(pathname: string): boolean {
  return /^\/escrow\/\d+/.test(pathname);
}
