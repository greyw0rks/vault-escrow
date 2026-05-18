import { useState, useMemo } from 'react';

export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(items.length / pageSize);
  const paged = useMemo(() => items.slice(page * pageSize, (page + 1) * pageSize), [items, page, pageSize]);
  const next = () => setPage(p => Math.min(p + 1, totalPages - 1));
  const prev = () => setPage(p => Math.max(p - 1, 0));
  const go = (p: number) => setPage(Math.max(0, Math.min(p, totalPages - 1)));
  return { paged, page, totalPages, next, prev, go, hasNext: page < totalPages - 1, hasPrev: page > 0 };
}
