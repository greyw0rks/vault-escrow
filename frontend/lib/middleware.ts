import type { NextRequest } from 'next/server';

export function getAddressFromCookie(req: NextRequest): string | null {
  return req.cookies.get('stx-address')?.value ?? null;
}

export function isProtectedRoute(pathname: string): boolean {
  const PROTECTED = ['/escrow/new', '/dashboard'];
  return PROTECTED.some(r => pathname.startsWith(r));
}

export function redirectToHome(req: NextRequest) {
  return Response.redirect(new URL('/', req.url));
}
