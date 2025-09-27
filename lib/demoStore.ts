// Simple client-side demo store using localStorage + custom events
// Simulates real-time updates for records, consents, and notifications

export type DemoRecord = {
  id: string;
  title: string;
  issuer: string;
  date: string;
};

export type DemoNotification = {
  id: string;
  type: 'appointment' | 'record' | 'security' | 'ai' | 'consent';
  text: string;
  time: string; // human-readable
};

const KEYS = {
  records: 'mln_demo_records',
  notifications: 'mln_demo_notifications',
  consents: 'mln_demo_consents',
};

const EVENT = 'mln_demo_update';

function nowLabel(): string {
  return new Date().toLocaleString();
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { key } }));
}

// Records
export function getDemoRecords(): DemoRecord[] {
  const fallback: DemoRecord[] = [
    { id: 'rec-1', title: 'Blood Test', issuer: 'Lagos General Hospital', date: '2025-09-10' },
    { id: 'rec-2', title: 'MRI Scan', issuer: 'Nairobi Imaging Center', date: '2025-09-15' },
  ];
  const current = readJSON<DemoRecord[] | null>(KEYS.records, null);
  if (!current) {
    writeJSON(KEYS.records, fallback);
    return fallback;
  }
  return current;
}

// Notifications
export function getNotifications(): DemoNotification[] {
  return readJSON<DemoNotification[]>(KEYS.notifications, []);
}

export function addNotification(n: Omit<DemoNotification, 'id' | 'time'> & { time?: string }) {
  const list = getNotifications();
  const item: DemoNotification = {
    id: `n-${Date.now()}`,
    type: n.type,
    text: n.text,
    time: n.time || nowLabel(),
  };
  writeJSON(KEYS.notifications, [item, ...list].slice(0, 50));
}

// Consents (by recordId => list of grantee DIDs)
export function getConsents(): Record<string, string[]> {
  return readJSON<Record<string, string[]>>(KEYS.consents, {});
}

export function grantConsent(recordId: string, granteeDid: string) {
  const consents = getConsents();
  const list = new Set(consents[recordId] || []);
  list.add(granteeDid);
  consents[recordId] = Array.from(list);
  writeJSON(KEYS.consents, consents);
}

export function revokeConsent(recordId: string, granteeDid: string) {
  const consents = getConsents();
  const list = new Set(consents[recordId] || []);
  list.delete(granteeDid);
  consents[recordId] = Array.from(list);
  writeJSON(KEYS.consents, consents);
}

// React hook for live notifications
import { useEffect, useState } from 'react';
export function useDemoNotifications() {
  const [items, setItems] = useState<DemoNotification[]>(getNotifications());
  useEffect(() => {
    const handler = () => setItems(getNotifications());
    window.addEventListener(EVENT as any, handler);
    return () => window.removeEventListener(EVENT as any, handler);
  }, []);
  return items;
}
