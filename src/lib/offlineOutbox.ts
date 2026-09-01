/**
 * offlineOutbox.ts — IndexedDB queue for sessions that fail to sync
 *
 * When the Supabase insert fails (no internet, missing credentials),
 * the session is queued here. On the next `window` online event or
 * manual flush, all queued items are retried.
 *
 * Uses idb-keyval for a minimal IndexedDB wrapper (~700B gzipped).
 */

import { get, set, del, keys } from 'idb-keyval';
import type { DbTracingSession } from './supabase';

const PREFIX = 'lyralearn:outbox:';

export interface OutboxEntry {
  id: string;       // local UUID
  payload: DbTracingSession;
  queuedAt: string; // ISO timestamp
}

/** Queue a session for later sync */
export async function queueSession(payload: DbTracingSession): Promise<void> {
  const id = crypto.randomUUID();
  const entry: OutboxEntry = { id, payload, queuedAt: new Date().toISOString() };
  await set(`${PREFIX}${id}`, entry);
  console.log('[LyraLearn] Session queued offline:', id);
}

/** Get all queued entries */
export async function getOutboxEntries(): Promise<OutboxEntry[]> {
  const allKeys = await keys<string>();
  const outboxKeys = allKeys.filter((k) => typeof k === 'string' && k.startsWith(PREFIX));
  const entries = await Promise.all(outboxKeys.map((k) => get<OutboxEntry>(k)));
  return entries.filter(Boolean) as OutboxEntry[];
}

/** Remove a specific entry (after successful sync) */
export async function removeOutboxEntry(id: string): Promise<void> {
  await del(`${PREFIX}${id}`);
}

/** Flush outbox → Supabase. Returns count of successfully synced rows. */
export async function flushOutbox(): Promise<number> {
  const { supabase } = await import('./supabase');
  if (!supabase) return 0;

  const entries = await getOutboxEntries();
  if (entries.length === 0) return 0;

  let synced = 0;
  for (const entry of entries) {
    const { error } = await supabase.from('tracing_sessions').insert(entry.payload as never);
    if (!error) {
      await removeOutboxEntry(entry.id);
      synced++;
    }
  }

  if (synced > 0) {
    console.log(`[LyraLearn] Outbox flushed: ${synced}/${entries.length} sessions synced`);
  }
  return synced;
}

/** Register the online event listener — call once at app startup */
export function registerOutboxSyncListener(): () => void {
  const handler = () => void flushOutbox();
  window.addEventListener('online', handler);
  return () => window.removeEventListener('online', handler);
}
