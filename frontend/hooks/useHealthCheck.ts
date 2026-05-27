'use client';
import { useState, useEffect } from 'react';
import { checkHealth, type HealthStatus } from '@/lib/health';

export function useHealthCheck(intervalMs = 60_000) {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [checking, setChecking] = useState(false);

  const check = async () => {
    setChecking(true);
    try { setStatus(await checkHealth()); } finally { setChecking(false); }
  };

  useEffect(() => {
    check();
    const t = setInterval(check, intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  return { status, checking, healthy: status?.api === 'ok' };
}
