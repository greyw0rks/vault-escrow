'use client';
import { useState, useEffect, useCallback } from 'react';

const REFRESH_MS = 60_000;
const API = 'https://api.coingecko.com/api/v3/simple/price?ids=blockstack&vs_currencies=usd&include_24hr_change=true';

export function useSTXPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [change24h, setChange24h] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      setPrice(data.blockstack?.usd ?? null);
      setChange24h(data.blockstack?.usd_24h_change ?? null);
    } catch (_) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
    const t = setInterval(fetch_, REFRESH_MS);
    return () => clearInterval(t);
  }, [fetch_]);

  const formatted = price != null ? `$${price.toFixed(4)}` : null;
  const trend = change24h == null ? 'flat' : change24h > 0 ? 'up' : 'down';

  return { price, formatted, change24h, trend, loading, refetch: fetch_ };
}
