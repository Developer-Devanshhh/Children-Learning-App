/**
 * offlineOutbox.ts — IndexedDB queue for sessions and assessments that fail to sync
 *
 * Supports:
 *   - Idempotent queuing (customId prevents duplicate entries)
 *   - Immediate per-item response persistence
 *   - Offline recovery across page refresh or connection loss
 *   - Auto-sync on 'online' window event
 */

import { get, set, del, keys } from 'idb-keyval';
import type { DbTracingSession } from './supabase';

const PREFIX = 'lyralearn:outbox:';
const ACTIVE_ASSESSMENT_KEY = 'lyralearn:active_assessment_state';

export interface OutboxEntry {
  id: string;        // UUID or idempotent custom ID
  table: string;     // Target Supabase table: 'tracing_sessions' | 'assessment_sessions' | 'assessment_responses' | etc.
  payload: unknown;
  queuedAt: string;  // ISO timestamp
}

/** Queue a generic database record with optional idempotent custom ID */
export async function queueRecord(table: string, payload: unknown, customId?: string): Promise<string> {
  const id = customId || crypto.randomUUID();
  const entry: OutboxEntry = { id, table, payload, queuedAt: new Date().toISOString() };
  await set(`${PREFIX}${id}`, entry);
  console.log(`[LyraLearn] Record queued in outbox for table '${table}':`, id);
  return id;
}

/** Queue a tracing session (backwards-compatible with Phase 2) */
export async function queueSession(payload: DbTracingSession): Promise<string> {
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

/** Save active assessment state to IndexedDB for refresh/interruption recovery */
export async function saveAssessmentRecoverySnapshot(state: unknown): Promise<void> {
  try {
    await set(ACTIVE_ASSESSMENT_KEY, {
      state,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[LyraLearn] Failed to save assessment recovery snapshot:', err);
  }
}

/** Retrieve active assessment recovery state */
export async function getAssessmentRecoverySnapshot(): Promise<{ state: unknown; updatedAt: string } | null> {
  try {
    const data = await get<{ state: unknown; updatedAt: string }>(ACTIVE_ASSESSMENT_KEY);
    return data ?? null;
  } catch (err) {
    console.warn('[LyraLearn] Failed to get assessment recovery snapshot:', err);
    return null;
  }
}

/** Clear active assessment recovery state upon completion or exit */
export async function clearAssessmentRecoverySnapshot(): Promise<void> {
  try {
    await del(ACTIVE_ASSESSMENT_KEY);
  } catch (err) {
    console.warn('[LyraLearn] Failed to clear assessment recovery snapshot:', err);
  }
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
    try {
      const { error } = await supabase.from(targetTable).insert(entry.payload as never);
      if (!error) {
        await removeOutboxEntry(entry.id);
        synced++;
      } else {
        // If error indicates duplicate key / unique constraint, safely remove to prevent blockages
        if (error.code === '23505') {
          await removeOutboxEntry(entry.id);
          synced++;
        } else {
          console.warn(`[LyraLearn] Sync retry failed for ${targetTable}:`, error.message);
        }
      }
    } catch (err) {
      console.warn(`[LyraLearn] Exception syncing ${targetTable}:`, err);
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
