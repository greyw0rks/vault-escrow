'use client';
import { useState, useCallback } from 'react';

export interface Notification { id: string; message: string; type: 'success' | 'error' | 'info'; }

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const add = useCallback((message: string, type: Notification['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setNotifications(ns => [...ns, { id, message, type }]);
    setTimeout(() => setNotifications(ns => ns.filter(n => n.id !== id)), 5000);
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications(ns => ns.filter(n => n.id !== id));
  }, []);

  return { notifications, add, remove };
}
