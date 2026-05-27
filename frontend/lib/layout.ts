export const BREAKPOINTS = {
  sm: 640, md: 768, lg: 1024, xl: 1280,
} as const;

export const MAX_WIDTH    = 900;
export const NAV_HEIGHT   = 64;
export const SIDEBAR_WIDTH = 280;

export function isMobileWidth(w: number): boolean   { return w < BREAKPOINTS.sm; }
export function isTabletWidth(w: number): boolean   { return w >= BREAKPOINTS.sm && w < BREAKPOINTS.lg; }
export function isDesktopWidth(w: number): boolean  { return w >= BREAKPOINTS.lg; }
