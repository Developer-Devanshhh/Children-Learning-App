/**
 * offlineOutbox.ts — IndexedDB queue for sessions and assessments that fail to sync
 *
 * When a Supabase insert fails (offline mode, network blip, missing credentials),
 * the record is queued in IndexedDB via idb-keyval. On reconnect (`online` event)
 * or manual flush, all queued records are retried against their respective tables.
 */

import { get, set, del, keys } from 'idb-keyval';
import type { DbTracingSession } from './supabase';

const PREFIX = 'lyralearn:outbox:';

export interface OutboxEntry {
  id: string;        // local UUID
  table: string;     // target Supabase table: 'tracing_sessions' | 'assessment_sessions' | 'assessment_responses' | etc.
  payload: unknown;
  queuedAt: string;  // ISO timestamp
}

/** Queue a generic database record for later sync */
export async function queueRecord(table: string, payload: unknown): Promise<void> {
  const id = crypto.randomUUID();
  const entry: OutboxEntry = { id, table, payload, queuedAt: new Date().toISOString() };
  await set(`${PREFIX}${id}`, entry);
  console.log(`[LyraLearn] Record queued offline in '${table}':`, id);
}

/** Queue a tracing session (backwards-compatible with Phase 2) */
export async function queueSession(payload: DbTracingSession): Promise<void> {
  return queueRecord('tracing_sessions', payload);
}

/** Get all queued entries */
export async function getOutboxEntries(): Promise<OutboxEntry[]> {
  const allKeys = await keys<string>();
  const outboxKeys = allKeys.filter((k) => typeof k === 'string' && k.startsWith(PREFIX));
  const entries = await Promise.all(outboxKeys.map((k) => get<OutboxEntry>(k)));
  return entries.filter(Boolean) as OutboxEntry[];
}

/** Remove a specific entry after successful sync */
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
    const targetTable = entry.table || 'tracing_sessions';
    const { error } = await supabase.from(targetTable).insert(entry.payload as never);
    if (!error) {
      await removeOutboxEntry(entry.id);
      synced++;
    } else {
      console.warn(`[LyraLearn] Sync retry failed for ${targetTable}:`, error.message);
    }
  }

  if (synced > 0) {
    console.log(`[LyraLearn] Outbox flushed: ${synced}/${entries.length} records synced to Supabase`);
  }
  return synced;
}

/** Register the online event listener — call once at app startup */
export function registerOutboxSyncListener(): () => void {
  const handler = () => void flushOutbox();
  window.addEventListener('online', handler);
  return () => window.removeEventListener('online', handler);
}
